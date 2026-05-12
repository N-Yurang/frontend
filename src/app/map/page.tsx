"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { 
  Music, 
  Play, 
  Shuffle, 
  MoreVertical, 
  MapPin, 
  Share2, 
  ChevronLeft
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRecommendationStore } from "@/store/useRecommendationStore";

// dynamically import leaflet component with ssr: false
const MapClient = dynamic(() => import('@/components/map/MapClient'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center text-gray-400">지도 로딩 중...</div>
});

export default function CourseMap() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const recommendations = useRecommendationStore((state) => state.recommendations);

  // 스토어 데이터를 컴포넌트 형식에 맞게 변환
  const ITINERARY = recommendations.length > 0 
    ? recommendations.map(p => ({
        id: p.order,
        name: p.name,
        desc: p.type || "AI 추천 장소",
        duration: p.duration || "예정",
        lat: p.lat,
        lng: p.lng
      }))
    : [
        { 
          id: 1, 
          name: "성흥산성 사랑나무", 
          desc: "인생샷 명소로 유명한 탁 트인 언덕",
          duration: "1h 30m",
          lat: 36.1950,
          lng: 126.9038
        },
        { 
          id: 2, 
          name: "부여 중앙시장", 
          desc: "점심 식사 및 현지 간식 탐방",
          duration: "1h 00m",
          lat: 36.2798,
          lng: 126.9140
        },
        { 
          id: 3, 
          name: "궁남지 야경", 
          desc: "은은한 조명이 예쁜 산책로 마무~리",
          duration: "45m",
          lat: 36.2748,
          lng: 126.9142
        },
      ];

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 pb-20 transition-colors duration-300">
      <header className="p-5 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
        <button className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">MY PLAYLIST</h1>
        <button className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-900 rounded-full">
          <Share2 size={20} />
        </button>
      </header>

      <main className="flex-1 px-5">
        <section className="mb-8 relative group">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-brand-red/20 border border-gray-100 dark:border-gray-800"
          >
            <MapClient itinerary={ITINERARY} />
          </motion.div>

          <div className="mt-8">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
              {recommendations.length > 0 ? "AI 추천 여행 코스" : "부여 감성 당일치기"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1 text-brand-red">
                <Music size={14} fill="currentColor" />
                <span>AI Recommended</span>
              </div>
              <span>•</span>
              <span>{ITINERARY.length} spots</span>
              <span>•</span>
              <span>{ITINERARY.some(p => p.duration !== "예정") ? "계획됨" : "시간 미정"}</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Track List</h3>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-brand-red transition-colors"><Shuffle size={18} /></button>
              <button className="w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-red/30"><Play size={14} fill="currentColor" /></button>
            </div>
          </div>

          {ITINERARY.map((place, index) => (
            <motion.div 
              key={place.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedPlaceId(place.id)}
              className={`flex items-center gap-4 p-4 rounded-3xl transition-all cursor-pointer
                ${selectedPlaceId === place.id 
                  ? "bg-brand-red/5 dark:bg-brand-red/10 ring-1 ring-brand-red/20" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-900"}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-lg font-black text-gray-400 dark:text-gray-600">
                  {index + 1}
                </div>
                {selectedPlaceId === place.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute -left-1 top-1/4 w-1 h-1/2 bg-brand-red rounded-full"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{place.name}</h4>
                <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{place.desc}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-black text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full">{place.duration}</span>
                <button className="text-gray-300 dark:text-gray-700"><MoreVertical size={18} /></button>
              </div>
            </motion.div>
          ))}
        </section>
      </main>

      {/* Floating Action Menu */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3">
        <button className="w-14 h-14 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center active:scale-95 transition-transform">
          <MapPin size={24} />
        </button>
      </div>
    </div>
  );
}
