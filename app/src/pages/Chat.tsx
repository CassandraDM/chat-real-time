import { useAuth } from "../contexts/AuthContext";
import MessageForm from "../components/chat/MessageForm";
import MessageList from "../components/chat/MessageList";
import UserInfo from "../components/chat/UserInfo";
import LogoutButton from "../components/LogoutButton";
import { useContext } from "react";
import { SocketContext } from "../contexts/SocketContext";
import UsersList from "../components/user/UsersList";

const Chat = () => {
  const { user } = useAuth();
  const socketContext = useContext(SocketContext);
  if (!socketContext) return null;

  const { connectedUsers } = socketContext;

  return (
    <div className="container mx-auto w-full h-screen">
      <div className="rounded-lg w-full h-full">
        <div className="h-5/6 relative">
          {/* Connected Users List with Popover */}
          <div className="backdrop-blur-sm bg-[#252834]/50 h-14 absolute top-0 right-3 w-full z-10 flex items-center px-4">
            <div className="text-white flex items-center">
              <UsersList connectedUsers={connectedUsers} />
            </div>
          </div>

          <div className="overflow-y-scroll h-full">
            <div className="pt-16">
              <MessageList socket={socketContext.socket} />
            </div>
          </div>
        </div>
        <div className="h-1/6 flex justify-center items-center">
          <div className="w-full gap-4 flex flex-col">
            {user && (
              <div className="">
                <MessageForm socket={socketContext.socket} />
              </div>
            )}
            <div className="flex justify-between">
              <UserInfo />
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
