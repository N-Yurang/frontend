"use client";

import { 
  Play, 
  Shuffle, 
  MoreVertical, 
  Music, 
  MapPin, 
  Clock, 
  Share2, 
  Heart,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseMap() {
  const ITINERARY = [
    { 
      id: 1, 
      name: "성흥산성 사랑나무", 
      desc: "인생샷 명소로 유명한 탁 트인 언덕",
      duration: "1h 30m"
    },
    { 
      id: 2, 
      name: "부여 중앙시장", 
      desc: "점심 식사 및 현지 간식 탐방",
      duration: "1h 00m"
    },
    { 
      id: 3, 
      name: "궁남지 야경", 
      desc: "은은한 조명이 예쁜 산책로 마무~리",
      duration: "45m"
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="pt-4 pb-4 px-5 bg-white dark:bg-gray-950 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between transition-colors duration-300">
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-900 dark:text-gray-100" />
        </button>
        <h1 className="text-[17px] font-bold text-gray-900 dark:text-gray-100">오늘의 추천 코스</h1>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Share2 size={20} className="text-gray-900 dark:text-gray-100" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Playlist Cover / Map Area */}
        <div className="px-5 pt-6 pb-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square w-full max-w-[320px] mx-auto bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-2xl relative flex items-center justify-center transition-colors shadow-gray-200 dark:shadow-black/50"
          >
            {/* Map Placeholder Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-16 h-16 bg-white/80 dark:bg-gray-700/80 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <MapPin size={32} className="text-brand-red" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-bold text-[16px] mb-1">지도 API 연동 영역</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">부여 당일치기 테마 플레이리스트</p>
            </div>
            
            {/* Playlist Overlay Details */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/40 backdrop-blur-md p-3 rounded-2xl text-white">
              <div className="flex flex-col">
                <span className="text-[10px] opacity-70 font-medium">NOW SELECTED</span>
                <span className="text-xs font-bold truncate max-w-[150px]">부여 성흥산성 사랑나무</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest">MAP</span>
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">부여 감성 당일치기</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1 text-brand-red">
                <Music size={14} fill="currentColor" />
                <span>AI Recommended</span>
              </div>
              <span>•</span>
              <span>3 spots</span>
              <span>•</span>
              <span>3h 15m</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button className="flex-1 h-14 bg-brand-red hover:bg-red-600 text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-red-200 dark:shadow-none transition-all active:scale-95">
              <Play size={24} fill="currentColor" />
              <span>동선 순서대로 보기</span>
            </button>
            <button className="w-14 h-14 border border-gray-200 dark:border-gray-800 rounded-2xl flex items-center justify-center text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors active:scale-95">
              <Shuffle size={24} />
            </button>
          </div>
        </div>

        {/* Track List Style Itinerary */}
        <div className="px-5 py-6 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Music size={20} className="text-gray-400" />
              <span>동선 리스트</span>
            </h3>
            <span className="text-xs font-bold text-gray-400">DURATION</span>
          </div>

          {ITINERARY.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-colors cursor-pointer group"
            >
              <div className="w-6 text-sm font-bold text-gray-400 text-center">
                {index + 1}
              </div>
              
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MapPin size={20} className="text-gray-400 group-hover:text-brand-red transition-colors" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] truncate transition-colors">{item.name}</h4>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{item.desc}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-gray-400">{item.duration}</span>
                <button className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
