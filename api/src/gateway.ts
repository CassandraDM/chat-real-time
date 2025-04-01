import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from './messages/entities/message.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string>();
  private connectedUsers = new Set<string>(); // Store connected users

  handleConnection(client: Socket) {
    const userId =
      client.handshake.auth.userId || client.handshake.query.userId;

    if (userId) {
      console.log(`Client connected: ${client.id}, User ID: ${userId}`);
      this.userSocketMap.set(userId as string, client.id);
      this.connectedUsers.add(userId as string);

      // Emit the updated list of users to all clients
      this.server.emit('update_users', Array.from(this.connectedUsers));
    } else {
      console.log(`Client connected without user ID: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove user from map and set
    for (const [userId, socketId] of this.userSocketMap.entries()) {
      if (socketId === client.id) {
        this.userSocketMap.delete(userId);
        this.connectedUsers.delete(userId);
        break;
      }
    }

    // Emit updated list of users
    this.server.emit('update_users', Array.from(this.connectedUsers));
  }

  @SubscribeMessage('newMessage')
  handleNewMessage(@MessageBody() message: Message): void {
    console.log('Received new message:', message);
    this.server.emit('newMessage', message);
  }
}
