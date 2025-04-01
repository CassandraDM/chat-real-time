import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { Socket } from "socket.io-client";

interface MessageListProps {
  socket: typeof Socket | null;
}

const MessageList: React.FC<MessageListProps> = ({ socket }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setRefresh] = useState(0); // Used just to force refresh
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, error } = useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: () => messageService.findAll(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (data) {
      setMessages(data);
    }
  }, [data]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, [socket]);

  // Fonction pour ajuster explicitement le décalage horaire de +2 heures
  const adjustTimezone = (dateString: string | Date) => {
    const date = new Date(dateString);
    // Ajuster explicitement de 2 heures
    date.setHours(date.getHours() + 2);
    return date;
  };

  // Fonction personnalisée pour formatage du temps relatif en français
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 5) return "à l'instant";
    if (diffInSeconds < 60) return `il y a ${diffInSeconds} secondes`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4)
      return `il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? "s" : ""}`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `il y a ${diffInMonths} mois`;

    const diffInYears = Math.floor(diffInDays / 365);
    return `il y a ${diffInYears} an${diffInYears > 1 ? "s" : ""}`;
  };

  if (isLoading) {
    return <div className="text-center">Loading messages...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        Error loading messages. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages?.map((message) => (
        <div key={message.id} className="rounded-lg bg-[#494D62] p-4 shadow-sm">
          <p className="text-gray-200">{message.text}</p>
          <div className="flex justify-between items-center text-sm text-white/40 mt-4">
            <p>{message?.user?.email}</p>
            <p className="">
              {formatRelativeTime(adjustTimezone(message.createdAt))}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
