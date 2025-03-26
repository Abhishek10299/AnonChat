"use client";
import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Message } from "@/model/User";
import { acceptMessagesSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(acceptMessagesSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", !response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to fetch message setting"
      );
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue,toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response.data.messages || []);
        if (refresh) {
          toast.error("Showing latest messages");
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast.error(
          axiosError.response?.data.message || "Failed to fetch message setting"
        );
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages,toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);
  //handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast.success(response.data.message);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast.error(
        axiosError.response?.data.message || "Failed to fetch message setting"
      );
    }
  };

  if (!session || !session.user) {
    return <div>Please Login</div>;
  }
  const{username}=session?.user as User
  //TODO: do more research
  const baseUrl=`${window.location.protocol}//${window.location.host}`
  const profileUrl=`${baseUrl}/u/${username}`

  const copyToClipboard=()=>{
    navigator.clipboard.writeText(profileUrl)
    toast.success("profile URL has been copied to clipboard")
  }

  
  return (
    <div className="container mx-auto my-8 p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">User Dashboard</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-600"
          />
          <Button onClick={copyToClipboard} className="px-4 py-2">Copy</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="text-lg font-medium">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      
      <Separator />
      
      <div className="mt-6 flex justify-start">
        <Button
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCcw className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="text-gray-500">No messages to display.</p>
        )}
      </div>
    </div>
  );
}
