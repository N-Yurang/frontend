"use client";

import { useState, useEffect, useEffect as ReactUseEffect } from "react";
import { User, Edit2, Settings } from "lucide-react";
import { useTheme } from "next-themes";

export default function MyPage() {
  const [userName, setUserName] = useState("여행자");
  const [tags, setTags] = useState<string[]>(["미디어트렌드", "숨은명소", "로컬맛집", "대중교통"]);
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
    
    const storedTags = localStorage.getItem('userTags');
    if (storedTags) {
      try {
        const parsedTags = JSON.parse(storedTags);
        if (Array.isArray(parsedTags) && parsedTags.length > 0) {
          setTags(parsedTags);
        }
      } catch (e) {
        console.error("Failed to parse stored tags");
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbfb] dark:bg-gray-950 pb-20 transition-colors duration-300">
      <div className="pt-12 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-10 border-b border-gray-50 dark:border-gray-800 flex items-center px-5">
        <div className="flex-1" />
        <h1 className="text-[17px] font-bold text-center text-gray-900 dark:text-gray-100">내 정보</h1>
        <div className="flex-1 flex justify-end">
          <button onClick={() => setIsThemeOpen(true)} className="hover:scale-110 transition-transform text-gray-800 dark:text-gray-200">
            <Settings size={26} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="px-5 mt-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between mb-8 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#f0f4f8] dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 transition-colors">
              <User size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1 transition-colors">{userName}님</h2>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">ID: 202210127</p>
            </div>
          </div>
          <button className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-gray-200 dark:hover:bg-gray-700">
            수정
          </button>
        </div>

        {/* Travel Preferences */}
        <div className="mb-10">
          <h3 className="flex items-center text-base font-bold text-gray-900 dark:text-gray-100 mb-4 gap-1.5 transition-colors">
            <span>✨</span> 나의 여행 취향
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {tags.map((tag) => (
              <span key={tag} className="border border-brand-red text-brand-red dark:border-red-500/50 dark:text-red-400 text-sm px-3.5 py-1.5 rounded-full font-medium shadow-sm transition-colors">
                #{tag}
              </span>
            ))}
            <button className="border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm px-3.5 py-1.5 rounded-full font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1">
              + 추가
            </button>
          </div>
        </div>

        {/* Travel Records */}
        <div>
          <h3 className="flex items-center text-base font-bold text-gray-900 dark:text-gray-100 mb-4 gap-1.5 transition-colors">
            <span>📁</span> 나의 여행 기록
          </h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-md dark:hover:bg-gray-800 transition-all">
              <span className="text-3xl">❤️</span>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors">찜한 여행지</span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-medium transition-colors">12개 장소</span>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center gap-3 cursor-pointer hover:shadow-md dark:hover:bg-gray-800 transition-all">
              <span className="text-3xl">🗓️</span>
              <div className="text-center">
                <span className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 transition-colors">저장된 코스</span>
                <span className="block text-[11px] text-gray-500 dark:text-gray-400 font-medium transition-colors">3개 일정</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-5 pt-12">
        <a href="/" className="block text-center w-full py-3.5 text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors bg-gray-50 dark:bg-gray-900 rounded-2xl">
          로그아웃
        </a>
      </div>

      {/* Theme Settings Modal */}
      {isThemeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsThemeOpen(false)}>
          <div className="bg-white dark:bg-gray-900 w-[80%] max-w-[320px] rounded-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">테마 설정</h2>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setTheme('light'); setIsThemeOpen(false); }} className={`py-3 px-4 rounded-xl text-left font-medium transition-colors ${theme === 'light' ? 'bg-brand-red text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                라이트 모드 ☀️
              </button>
              <button onClick={() => { setTheme('dark'); setIsThemeOpen(false); }} className={`py-3 px-4 rounded-xl text-left font-medium transition-colors ${theme === 'dark' ? 'bg-brand-red text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                다크 모드 🌙
              </button>
              <button onClick={() => { setTheme('system'); setIsThemeOpen(false); }} className={`py-3 px-4 rounded-xl text-left font-medium transition-colors ${theme === 'system' ? 'bg-brand-red text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                시스템 설정 💻
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
