import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LogIn } from "lucide-react";
import UserAvatar from "../user/UserAvatar";

const UserInfo: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button
        onClick={() => navigate("/signin")}
        className="w-full cursor-pointer"
      >
        <LogIn />
        <span>Se connecter</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <UserAvatar email={user.email} showStatus={true} size="md" />
      <div className="flex flex-col">
        <span className="font-medium text-gray-200">{user.email}</span>
        <span className="text-sm text-gray-500">En ligne</span>
      </div>
    </div>
  );
};

export default UserInfo;
