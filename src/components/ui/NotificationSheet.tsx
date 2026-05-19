"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Heart, MessageSquare, Sparkles } from "lucide-react";

interface Notification {
  id: number;
  icon: React.ReactNode;
  content: React.ReactNode;
  time: string;
  isUnread: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    icon: <Heart size={20} className="text-[#FF4B4B] fill-[#FF4B4B]" />,
    content: (
      <span>
        <strong>여행러버</strong>님이 회원님의 플레이리스트를 저장했습니다.
      </span>
    ),
    time: "5분 전",
    isUnread: true,
  },
  {
    id: 2,
    icon: <MessageSquare size={20} className="text-[#FF4B4B]" />,
    content: (
      <span>
        <strong>AI 챗봇</strong>강릉 감성 코스가 완성되었습니다!
      </span>
    ),
    time: "1시간 전",
    isUnread: true,
  },
  {
    id: 3,
    icon: <Sparkles size={20} className="text-[#FF4B4B]" />,
    content: (
      <span>
        <strong>시스템</strong>새로운 드라마 촬영지가 업데이트되었습니다.
      </span>
    ),
    time: "3시간 전",
    isUnread: false,
  },
  {
    id: 4,
    icon: <Heart size={20} className="text-[#FF4B4B] fill-[#FF4B4B]" />,
    content: (
      <span>
        <strong>카페투어</strong>님이 회원님을 팔로우했습니다.
      </span>
    ),
    time: "1일 전",
    isUnread: false,
  },
];

interface NotificationSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSheet({ isOpen, onClose }: NotificationSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[100] max-w-[480px] mx-auto"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto h-[90vh] bg-white dark:bg-gray-950 z-[101] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <button onClick={onClose} className="p-1 -ml-1 text-gray-900 dark:text-white active:scale-95 transition-transform">
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                알림
              </h2>
              <div className="w-6" /> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pb-safe">
              {mockNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 p-4 border-b border-gray-100/50 dark:border-gray-800/50 transition-colors ${
                    notif.isUnread ? "bg-[#FFF5F5] dark:bg-red-950/20" : "bg-white dark:bg-gray-950"
                  }`}
                >
                  {/* Icon */}
                  <div className="w-[42px] h-[42px] rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center flex-shrink-0">
                    {notif.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 pt-1">
                    <p className="text-[14px] text-gray-800 dark:text-gray-200 leading-snug">
                      {notif.content}
                    </p>
                    <span className="text-[12px] text-gray-400 mt-1.5 block font-medium">
                      {notif.time}
                    </span>
                  </div>

                  {/* Unread Dot */}
                  <div className="pt-2 pl-1 pr-1">
                    {notif.isUnread && (
                      <div className="w-2 h-2 rounded-full bg-[#FF4B4B]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
