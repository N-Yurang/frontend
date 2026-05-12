"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music4, Mic, Send, Plus, Headphones, Volume2, Info, ChevronLeft, Map as MapIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRecommendationStore, RecommendedPlace } from '@/store/useRecommendationStore';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function TripAIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "ai",
      content: "안녕하세요! TRIPLY AI 플레이리스터입니다❤️\n\n여러분의 여행을 하나의 특별한 트랙 리스트로 멋지게 기획해 드릴게요. 어떤 분위기의 여행을 꿈꾸고 계신가요? 🎶",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentItinerary, setCurrentItinerary] = useState<RecommendedPlace[] | null>(null);
  const router = useRouter();
  const setRecommendations = useRecommendationStore((state) => state.setRecommendations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
           chat_history: [
                { role: "user", content: currentInput }
            ]
         }),
      });

      if (!response.ok) {
        throw new Error("서버 응답 에러");
      }

      const data = await response.json();

      if (data.status === "success") {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: data.ai_reply,
        };
        setMessages((prev) => [...prev, aiMsg]);

        // 추천 경로 데이터 저장 로직
        if (data.itinerary && Array.isArray(data.itinerary)) {
          setCurrentItinerary(data.itinerary);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("AI 연결 실패:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "죄송해요, AI 플레이리스터 서버와 잠시 연결이 끊겼어요. 파이썬 터미널에서 서버가 켜져 있는지 확인해 주세요! 🎶",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-950 relative transition-colors duration-500 overflow-hidden">
      {/* Wave Background Decorative Elements */}
      <div className="absolute top-20 right-[-10%] w-64 h-64 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-[-10%] w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="pt-4 pb-4 px-5 bg-white dark:bg-gray-950 sticky top-0 z-10 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between transition-colors">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[17px] font-black text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2">
          <Music4 size={20} className="text-brand-red" />
          <span>AI 플레이리스터</span>
        </h1>
        <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <Info size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-hide space-y-8 bg-gray-50/30 dark:bg-gray-950/20 backdrop-blur-sm">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              {msg.role === 'ai' && idx > 0 && (
                <div className="flex items-center gap-1.5 mb-2 ml-1">
                  <div className="w-5 h-5 bg-brand-red/10 rounded-full flex items-center justify-center">
                    <Headphones size={12} className="text-brand-red" />
                  </div>
                  <span className="text-[10px] font-black text-brand-red tracking-widest uppercase">CURATED TRACK</span>
                </div>
              )}

              <div className={`whitespace-pre-wrap break-words relative px-5 py-3.5 text-[15px] leading-relaxed transition-all shadow-lg shadow-gray-200/50 dark:shadow-none
                ${msg.role === "user"
                  ? "bg-brand-red text-white rounded-[24px] rounded-tr-none max-w-[85%]"
                  : "bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-[24px] rounded-tl-none max-w-[85%]"}`}>
                {msg.content}

                {msg.role === 'ai' && (
                  <div className="absolute -bottom-6 left-0 flex items-center gap-1 opacity-40">
                    <Volume2 size={12} />
                    <span className="text-[9px] font-bold">PLAYLISTER RECOMIND</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start pt-2">
            <div className="flex items-center gap-2 mb-2 ml-1">
              <span className="text-[9px] font-bold text-gray-400 animate-pulse uppercase tracking-wider">PLAYLISTER IS ANALYZING...</span>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 border border-white/50 dark:border-gray-700/50 px-6 py-4 rounded-[24px] rounded-tl-none shadow-sm flex items-center gap-1.5 backdrop-blur-md">
              {[0.1, 0.2, 0.3, 0.4].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 16, 8] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay }}
                  className="w-1 bg-brand-red rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Floating Confirm Button */}
      <AnimatePresence>
        {currentItinerary && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-32 left-0 right-0 px-10 z-20"
          >
            <button 
              onClick={() => {
                setRecommendations(currentItinerary);
                router.push('/map');
              }}
              className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl shadow-2xl flex items-center justify-center gap-3 font-black text-[16px] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <MapIcon size={20} />
              <span>추천 동선 확인하기</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Overlay / Controller Style */}
      <div className="px-5 py-4 pb-8 bg-white dark:bg-gray-950 transition-colors border-t border-gray-50 dark:border-gray-900">
        <div className="relative flex items-center min-h-[58px] bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border border-transparent focus-within:border-brand-red/30 rounded-[28px] px-4 py-2 shadow-inner focus-within:bg-white dark:focus-within:bg-gray-900 transition-all group">
          <button className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-red transition-colors">
            <Plus size={22} strokeWidth={2.5} />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="플레이리스터에게 메시지 보내기..."
            className="flex-1 text-[15px] outline-none bg-transparent placeholder-gray-400 dark:text-white px-3 font-medium"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1.5">
            <button className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-brand-red transition-all active:scale-90">
              <Mic size={22} strokeWidth={2.5} />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95
                ${input.trim()
                  ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-400"}`}
            >
              <Send size={18} fill={input.trim() ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}