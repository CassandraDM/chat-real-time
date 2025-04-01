import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from './users/users.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly usersService: UsersService) {}

  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string>();
  private connectedUsers = new Set<string>();

  async handleConnection(client: Socket) {
    const userEmail =
      client.handshake.auth.userId || client.handshake.query.userId;

    if (userEmail) {
      console.log(`Client connected: ${client.id}, User Email: ${userEmail}`);
      this.userSocketMap.set(userEmail as string, client.id);
      this.connectedUsers.add(userEmail as string);

      // Important: Emit the updated list to all clients
      this.server.emit('connected_users', Array.from(this.connectedUsers));

      try {
        const user = await this.usersService.findByEmail(userEmail as string);
        await this.usersService.update(user.id, {
          lastConnectedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating user connection time:', error);
      }
    }
  }

  async handleDisconnect(client: Socket) {
    let userEmail: string | undefined;

    for (const [email, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        userEmail = email;
        break;
      }
    }

    if (userEmail) {
      console.log(
        `Client disconnected: ${client.id}, User Email: ${userEmail}`,
      );
      this.userSocketMap.delete(userEmail);
      this.connectedUsers.delete(userEmail);

      // Important: Emit the updated list to all clients
      this.server.emit('connected_users', Array.from(this.connectedUsers));

      try {
        const user = await this.usersService.findByEmail(userEmail);
        await this.usersService.update(user.id, {
          lastDisconnectedAt: new Date(),
        });
      } catch (error) {
        console.error('Error updating user disconnection time:', error);
      }
    }
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log('Received new message:', message);
    console.log('From client:', client.id);

    // Broadcast to ALL clients including sender
    this.server.emit('newMessage', message);
  }
}
