import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import UserAvatar from "./UserAvatar";
import { userService, User } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext"; // Add this import

interface UsersListProps {
  connectedUsers: string[];
}

const UsersList: React.FC<UsersListProps> = ({ connectedUsers }) => {
  // Add state to control popover visibility
  const [isOpen, setIsOpen] = useState(false);
  const { user: currentUser } = useAuth(); // Get the current user

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => userService.findAll(),
  });

  const isUserOnline = (email: string) => {
    return connectedUsers.includes(email);
  };

  // Check if this is the current user's email
  const isCurrentUser = (email: string) => {
    return currentUser?.email === email;
  };

  const getOnlineUsers = () => {
    return users?.filter((user) => isUserOnline(user.email)) || [];
  };

  const getOfflineUsers = () => {
    return users?.filter((user) => !isUserOnline(user.email)) || [];
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center cursor-pointer hover:bg-[#3a3f52] px-3 py-1 rounded-md transition-colors"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <span className="font-semibold mr-3 text-gray-200">Online: </span>
          <div className="flex -space-x-2 overflow-hidden">
            {connectedUsers.length > 0 ? (
              connectedUsers.slice(0, 3).map((email, index) => (
                <div
                  key={index}
                  className="tooltip"
                  data-tip={email + (isCurrentUser(email) ? " (you)" : "")}
                >
                  <UserAvatar email={email} showStatus={false} size="sm" />
                </div>
              ))
            ) : (
              <span>No users online</span>
            )}
            {connectedUsers.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-[#3a3f52] flex items-center justify-center text-xs text-white font-semibold">
                +{connectedUsers.length - 3}
              </div>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 max-h-80 overflow-y-auto"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {isLoading ? (
          <div className="py-2">Loading users...</div>
        ) : (
          <>
            {/* Online Users Section */}
            <div className="mb-4">
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                Online Users ({getOnlineUsers().length})
              </h3>
              <div className="space-y-2">
                {getOnlineUsers().length > 0 ? (
                  getOnlineUsers().map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          email={user.email}
                          showStatus={true}
                          size="sm"
                        />
                        <span>
                          {user.email}
                          {isCurrentUser(user.email) && (
                            <span className="ml-1 text-sm font-medium text-blue-500">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No users online</div>
                )}
              </div>
            </div>

            {/* Offline Users Section */}
            <div>
              <h3 className="font-medium text-lg mb-2 flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                Offline Users ({getOfflineUsers().length})
              </h3>
              <div className="space-y-2">
                {getOfflineUsers().length > 0 ? (
                  getOfflineUsers().map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <UserAvatar
                          email={user.email}
                          showStatus={false}
                          size="sm"
                        />
                        <span className="text-gray-500">
                          {user.email}
                          {isCurrentUser(user.email) && (
                            <span className="ml-1 text-sm font-medium text-blue-500">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No offline users</div>
                )}
              </div>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UsersList;
