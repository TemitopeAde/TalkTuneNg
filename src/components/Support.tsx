import React, { useState } from "react";
import { ArrowLeft, Send, MessageCircle, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isUser: boolean;
  isSelected?: boolean;
}

interface SupportProps {
  onBack?: () => void;
  onSendMessage?: (message: string) => void;
}

const Support: React.FC<SupportProps> = ({ onBack, onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Your laundry has been successfully picked up from your location and is on its way for cleaning.",
      timestamp: "11:09am",
      isUser: false,
    },
    {
      id: "2",
      text: "Your laundry has been successfully picked up from your location and is on its way for cleaning.",
      timestamp: "11:09am",
      isUser: false,
      isSelected: true,
    },
    {
      id: "3",
      text: "Your laundry has been successfully picked up from your location and is on its way for cleaning.",
      timestamp: "11:09am",
      isUser: false,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isUser: true,
      };

      setMessages((prev) => [...prev, newMessage]);
      onSendMessage?.(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-full h-full overflow-hidden py-4">
      <button
        // onClick={onClose}
        className="p-2 rounded-full mx-4 bg-gray-700 hover:bg-gray-600"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      <h2 className="text-2xl font-medium my-4 px-4">Help Center</h2>

      {/* Payment Methods */}
      <div className="relative h-[60vh] overflow-hidden flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-32 px-4 h-full flex flex-col">
          {messages.map((message) => (
            <div key={message.id} className={cn("w-full flex", message.isSelected && "justify-end")}>
              {message.isSelected ? (
                <div className="bg-[#00246B] rounded-2xl p-6 max-w-md">
                  <p className="text-white text-sm md:text-lg leading-relaxed mb-2">
                    {message.text}
                  </p>
                  <p className="text-blue-200 text-xs md:text-sm ">{message.timestamp}</p>
                </div>
              ) : (
                <div className="bg-[#FFFFFF33] backdrop-blur-sm rounded-2xl p-6 max-w-md border border-slate-600/30">
                  <div className="flex justify-between items-start">
                    <p className="text-white text-sm md:text-lg leading-relaxed flex-1 pr-4">
                      {message.text}
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm whitespace-nowrap">
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Field */}
        <div className="flex items-center absolute px-4  w-full bottom-5 gap-4 pb-4">
          <div className="flex-1 relative">
            <div className="flex items-center bg-slate-700/70 backdrop-blur-sm rounded-2xl border border-slate-600/30">
              <MessageCircle className="w-5 h-5 text-slate-400 ml-6" />
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter message"
                className="flex-1 bg-transparent text-white placeholder-slate-400 px-4 py-6 text-sm md:text-lg focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="w-14 h-14 bg-white abs hover:bg-slate-100 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
          >
            <Send
              className={`w-6 h-6 ${
                inputMessage.trim() ? "text-slate-800" : "text-slate-400"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
