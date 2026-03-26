"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function TripAIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // 1. 사용자 메시지 추가
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input; // 입력값 백업
    setInput("");
    setIsLoading(true);

    // 2. 파이썬 AI 서버 연동
    try {
      const response = await fetch("http://127.0.0.1:8000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: currentInput }),
      });

      const data = await response.json();

      if (data.status === "success") {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.ai_reply,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("AI 연결 실패:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "죄송해요, AI 서버와 연결이 끊겼어요. 파이썬 터미널을 확인해 주세요!",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-950 relative transition-colors duration-300">
      <div className="pt-12 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-10 transition-colors duration-300">
        <h1 className="text-[17px] font-bold text-center text-gray-900 dark:text-gray-100 transition-colors">AI 챗봇 상담</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide space-y-6">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div className={`shadow-sm whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed transition-colors
              ${msg.role === "user"
                ? "bg-[#f26b60] text-white rounded-2xl rounded-tr-sm max-w-[85%]"
                : "bg-[#f8f9fa] dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm max-w-[85%]"}`}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
            <div className="bg-[#f8f9fa] dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1 transition-colors">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="relative flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2 shadow-sm focus-within:border-gray-400 dark:focus-within:border-gray-600 transition-colors duration-300">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="w-full text-[15px] outline-none bg-transparent placeholder-gray-400 dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 px-4 h-10 flex items-center justify-center bg-[#2b2b2b] text-white rounded-xl font-medium text-[14px] disabled:bg-gray-200 disabled:text-gray-400 transition-colors ml-2"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
}