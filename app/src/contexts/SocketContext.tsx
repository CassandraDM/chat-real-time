import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

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
    if (!user) return;

    const socketInstance = io("http://localhost:8000", {
      auth: { userId: user.email }, // Send user ID to backend
    });

    socketInstance.on("connect", () => {
      console.log("Connected to socket server");
      setSocket(socketInstance);
    });

    socketInstance.on("update_users", (users: string[]) => {
      console.log("Updated users:", users);
      setConnectedUsers(users);
    });

    return () => {
      socketInstance.disconnect();
      socketInstance.off("update_users");
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connectedUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
