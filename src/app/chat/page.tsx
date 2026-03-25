"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "안녕하세요! 캡스톤 여행 AI입니다. 🤖\n어떤 분위기의 여행을 떠나고 싶으신가요? (예: 바다가 보이는 조용한 카페 추천해줘)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Mock AI Response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "사진 찍기 좋은 당일치기 데이트라면, 최근 SNS에서 '촌캉스'로 뜨고 있는 충남 부여를 추천해 드려요! 📸\n\n일정을 짜드릴까요?",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white relative">
      <div className="pt-12 pb-4 bg-white sticky top-0 z-10">
        <h1 className="text-[17px] font-bold text-center text-gray-900">AI 챗봇 상담</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className={`shadow-sm whitespace-pre-line px-4 py-3 text-[15px] leading-[1.6] ${
                msg.role === "user"
                  ? "bg-brand-red text-white rounded-2xl rounded-tr-sm max-w-[85%]"
                  : "bg-[#f8f9fa] text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm max-w-[85%]"
              }`}>
                {msg.content}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
            <div className="bg-[#f8f9fa] border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white">
        <div className="relative flex items-center bg-white border border-gray-200 rounded-3xl pl-4 pr-1.5 py-1.5 shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="w-full text-[15px] outline-none bg-transparent placeholder-gray-400 text-gray-800"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 px-4 h-10 flex items-center justify-center bg-[#2b2b2b] text-white rounded-full text-sm font-semibold disabled:bg-gray-200 disabled:text-gray-400 transition-colors ml-2"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}
