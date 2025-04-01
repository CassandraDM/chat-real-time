import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import UserAvatar from "./UserAvatar";
import { userService, User } from "../../services/userService";

interface UsersListProps {
  connectedUsers: string[];
}

const UsersList: React.FC<UsersListProps> = ({ connectedUsers }) => {
  // Add state to control popover visibility
  const [isOpen, setIsOpen] = useState(false);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => userService.findAll(),
  });

  const isUserOnline = (email: string) => {
    return connectedUsers.includes(email);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center cursor-pointer hover:bg-[#3a3f52] px-3 py-1 rounded-md transition-colors"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <span className="font-semibold mr-3">Online: </span>
          <div className="flex -space-x-2 overflow-hidden">
            {connectedUsers.length > 0 ? (
              connectedUsers.slice(0, 3).map((email, index) => (
                <div key={index} className="tooltip" data-tip={email}>
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
        <h3 className="font-medium text-lg mb-2">All Users</h3>
        {isLoading ? (
          <div className="py-2">Loading users...</div>
        ) : (
          <div className="space-y-2">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <UserAvatar email={user.email} showStatus={false} size="sm" />
                  <span>{user.email}</span>
                </div>
                <div
                  className={`h-3 w-3 rounded-full ${
                    isUserOnline(user.email) ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default UsersList;
