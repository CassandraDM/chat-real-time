import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  messageService,
  CreateMessageDto,
} from "../../services/messageService";
import { SendHorizontal } from "lucide-react";
import { Socket } from "socket.io-client";

interface MessageFormProps {
  socket: typeof Socket | null;
}

const MessageForm: React.FC<MessageFormProps> = ({ socket }) => {
  const { register, handleSubmit, reset, watch } = useForm<CreateMessageDto>();
  const queryClient = useQueryClient();
  const messageText = watch("text", "");

  const allowToSend = messageText.trim() !== "";

  // In your submit handler or mutation success callback
  const mutation = useMutation({
    mutationFn: (data: CreateMessageDto) => messageService.create(data),
    onSuccess: (newMessage) => {
      console.log("Message saved, now emitting socket event:", newMessage);

      if (socket) {
        // Make sure socket is connected before emitting
        if (socket.connected) {
          socket.emit("newMessage", newMessage);
          console.log("Socket event emitted");
        } else {
          console.error("Socket not connected - can't emit event");
        }
      } else {
        console.error("Socket is null - can't emit event");
      }

      queryClient.invalidateQueries({ queryKey: ["messages"] });
      reset();
    },
    onError: (error) => {
      console.error("Error creating message:", error);
    },
  });

  const onSubmit = (data: CreateMessageDto) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative">
      <div className="flex gap-2">
        <input
          {...register("text", { required: true })}
          type="text"
          placeholder="Type your message..."
          className="flex-1 rounded-lg border bg-[#494D62] border-[#494D62] px-4 py-2 text-gray-200 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={mutation.isPending || !allowToSend}
          className={`absolute right-0 top-0 bottom-0 rounded-r-lg bg-indigo-500 px-4 text-gray-200 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer ${
            allowToSend ? "opacity-100" : "opacity-0"
          }`}
        >
          {mutation.isPending ? "Sending..." : <SendHorizontal />}
        </button>
      </div>
      {mutation.isError && (
        <p className="mt-2 text-sm text-red-600">
          Error sending message. Please try again.
        </p>
      )}
    </form>
  );
};

export default MessageForm;
