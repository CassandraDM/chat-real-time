import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService, Message } from "../../services/messageService";
import { Socket } from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import UserAvatar from "../user/UserAvatar";

interface MessageListProps {
  socket: typeof Socket | null;
}

const MessageList: React.FC<MessageListProps> = ({ socket }) => {
  const { user: currentUser } = useAuth(); // Get the current user
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

    // Define the event handler outside to avoid duplicate listeners
    const handleNewMessage = (message: Message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => {
        // Check if message already exists to prevent duplicates
        if (prevMessages.some((m) => m.id === message.id)) {
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    };

    // Add event listener
    socket.on("newMessage", handleNewMessage);

    // Clean up when component unmounts or socket changes
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket]);

  // Check if a message is from the current user
  const isCurrentUserMessage = (message: Message) => {
    return message.user?.email === currentUser?.email;
  };

  // Function to adjust timezone by +2 hours
  const adjustTimezone = (dateString: string | Date) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);
    return date;
  };

  // Function for relative time formatting in French
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

  // Group messages by sender to avoid showing repeated avatars
  const groupMessagesBySender = () => {
    const grouped = [];
    let currentGroup: Message[] = [];

    messages?.forEach((message, index) => {
      // Start a new group if this is the first message or if sender changed
      if (
        index === 0 ||
        message.user?.email !== messages[index - 1].user?.email
      ) {
        if (currentGroup.length > 0) {
          grouped.push([...currentGroup]);
        }
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    // Don't forget to add the last group
    if (currentGroup.length > 0) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  return (
    <div className="space-y-4 p-4">
      {groupMessagesBySender().map((group, groupIndex) => {
        const isCurrentUser = isCurrentUserMessage(group[0]);

        return (
          <div
            key={`group-${groupIndex}`}
            className={`flex ${
              isCurrentUser ? "justify-end" : "justify-start"
            } mb-4`}
          >
            {/* Avatar for other users, shown only for the first message in group */}
            {!isCurrentUser && (
              <div className="self-end mb-2 mr-2">
                <UserAvatar
                  email={group[0].user?.email || ""}
                  showStatus={false}
                  size="sm"
                />
              </div>
            )}

            <div
              className={`flex flex-col ${
                isCurrentUser ? "items-end" : "items-start"
              } max-w-[70%]`}
            >
              {/* Show user name only for the first message in group */}
              {!isCurrentUser && (
                <span className="text-xs text-gray-400 mb-1 ml-1">
                  {group[0].user?.email}
                </span>
              )}

              {/* Message bubbles */}
              {group.map((message, messageIndex) => (
                <div
                  key={message.id}
                  className={`
                    mb-1 px-4 py-2 rounded-2xl shadow-sm
                    ${
                      isCurrentUser
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-[#494D62] text-gray-200 rounded-bl-none"
                    }
                    ${messageIndex === group.length - 1 ? "mb-1" : "mb-1"}
                  `}
                >
                  <p>{message.text}</p>
                </div>
              ))}

              {/* Timestamp shown only for the last message in group */}
              <span className="text-xs text-gray-400 mt-1 px-1">
                {formatRelativeTime(
                  adjustTimezone(group[group.length - 1].createdAt)
                )}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
