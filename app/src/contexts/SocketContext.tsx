import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

// Define context type
interface SocketContextType {
  socket: typeof Socket | null;
  connectedUsers: string[];
}

// Create context
export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setConnectedUsers([]); // Clear connected users when logged out
      return;
    }

    const socketInstance = io("http://localhost:8000", {
      auth: { userId: user.email }, // Send user ID to backend
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected");
      setSocket(socketInstance);
    });

    // Listen for connected_users events
    socketInstance.on("connected_users", (users: string[]) => {
      console.log("Connected users updated:", users);
      setConnectedUsers(users);
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socketInstance.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      console.log("Cleaning up socket connection");
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Provide both the socket and connectedUsers to consumers
  return (
    <SocketContext.Provider value={{ socket, connectedUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
