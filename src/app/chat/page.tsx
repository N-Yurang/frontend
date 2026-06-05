"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music4, Send, Plus, Headphones, Volume2, ChevronLeft, Map as MapIcon, Loader2, RotateCcw, History, X, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRecommendationStore } from '@/store/useRecommendationStore';
import { useChatStore } from '@/store/useChatStore';

export default function TripAIChat() {
  const [input, setInput] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { messages, currentItinerary, currentCourseName, isLoading, sendMessage, clearChat, pastSessions, loadSession, deleteSession } = useChatStore();
  const router = useRouter();
  const setRecommendations = useRecommendationStore((state) => state.setRecommendations);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    await sendMessage(currentInput);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-950 relative transition-colors duration-500 overflow-hidden">
      {/* Wave Background Decorative Elements */}
      <div className="absolute top-20 right-[-10%] w-64 h-64 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-[-10%] w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* History Drawer */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-[80%] max-w-[320px] bg-white dark:bg-gray-950 z-50 shadow-2xl flex flex-col"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-900 flex items-center justify-between">
                <h2 className="text-[16px] font-black flex items-center gap-2 text-gray-900 dark:text-white">
                  <History size={18} className="text-brand-red" />
                  지난 대화 기록
                </h2>
                <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {pastSessions.length === 0 ? (
                  <div className="text-center text-gray-400 text-[13px] py-10">
                    저장된 대화 기록이 없습니다.
                  </div>
                ) : (
                  pastSessions.map((session) => (
                    <div key={session.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-800" onClick={() => {
                      loadSession(session.id);
                      setIsHistoryOpen(false);
                    }}>
                      <div className="flex-1 overflow-hidden pr-3">
                        <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{session.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="기록 삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="pt-4 pb-4 px-5 bg-white dark:bg-gray-950 sticky top-0 z-10 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between transition-colors">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[17px] font-black text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2">
          <Music4 size={20} className="text-brand-red" />
          <span>AI 플레이리스터</span>
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsHistoryOpen(true)} className="text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors" title="대화 기록">
            <History size={20} />
          </button>
          <button onClick={clearChat} className="text-gray-400 hover:text-brand-red dark:hover:text-brand-red transition-colors" title="대화내용 초기화">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-1 scrollbar-hide space-y-8 bg-gray-50/30 dark:bg-gray-950/20 backdrop-blur-sm">
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-start pt-2 space-y-3"
          >
            <div className="flex items-center gap-2 mb-1 ml-1">
              <div className="w-5 h-5 bg-brand-red/10 rounded-full flex items-center justify-center animate-spin-slow">
                <Headphones size={12} className="text-brand-red" />
              </div>
              <span className="text-[10px] font-black text-brand-red tracking-widest uppercase animate-pulse">
                TRIPLY가 여행지를 분석 중입니다...
              </span>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 border border-white/50 dark:border-gray-700/50 px-5 py-3.5 rounded-[24px] rounded-tl-none shadow-lg backdrop-blur-md flex items-center gap-4">
              <div className="relative">
                <Loader2 className="w-5 h-5 text-brand-red animate-spin" />
                <div className="absolute inset-0 bg-brand-red/20 blur-md rounded-full animate-pulse" />
              </div>
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [0, -5, 0],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                    className="w-1.5 h-1.5 bg-brand-red rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {/* Inline Confirm Button */}
        <AnimatePresence>
          {currentItinerary && messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-center pt-2"
            >
              <button
                onClick={() => {
                  const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'AI 추천 여행 코스';
                  const defaultTitle = firstUserMsg.length > 15 ? firstUserMsg.slice(0, 15) + '...' : firstUserMsg;
                  const title = currentCourseName || defaultTitle;
                  setRecommendations(currentItinerary, title);
                  router.push('/map');
                }}
                className="px-6 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full shadow-lg flex items-center justify-center gap-2 font-black text-[14px] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MapIcon size={18} />
                <span>추천 동선 확인하기</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} className="!mt-0 !h-0 opacity-0 overflow-hidden" />
      </div>

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