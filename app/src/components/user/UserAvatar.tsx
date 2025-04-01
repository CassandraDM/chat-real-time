import React from "react";

interface UserAvatarProps {
  email: string;
  showStatus?: boolean;
  size?: "sm" | "md" | "lg";
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  email,
  showStatus = true,
  size = "md",
}) => {
  // Size mappings
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
  };

  const dotSizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold`}
      >
        {email && email[0] ? email[0].toUpperCase() : "?"}
      </div>
      {showStatus && (
        <div
          className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} rounded-full bg-green-500 border-2 border-white`}
        ></div>
      )}
    </div>
  );
};

export default UserAvatar;
