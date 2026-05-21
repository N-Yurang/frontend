"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { 
  Music, 
  Play, 
  Shuffle, 
  MapPin, 
  Share2, 
  ChevronLeft,
  GripVertical,
  Edit3,
  Check
} from 'lucide-react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useRecommendationStore, RecommendedPlace } from "@/store/useRecommendationStore";

// dynamically import leaflet component with ssr: false
const MapClient = dynamic(() => import('@/components/map/MapClient'), { 
  ssr: false,
  loading: () => <div className="h-[280px] w-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center text-gray-400">지도 로딩 중...</div>
});

const DB_PLACE_TAGS: Record<string, string[]> = {
  "청령포": ["고즈넉한", "조용한", "혼자", "역사탐방", "걷기좋은"],
  "백제문화단지": ["활기찬", "웅장한", "아이와함께", "역사탐방", "야경명소"],
  "남열해돋이해수욕장": ["활기찬", "낭만적인", "친구와", "바다뷰", "사진맛집"],
  "젊은달와이파크": ["활기찬", "감성적인", "친구와", "사진맛집", "이색체험"],
  "별마로천문대": ["감성적인", "낭만적인", "커플", "야경명소", "사진맛집"],
  "요선암 돌개구멍": ["신비로운", "조용한", "아이와함께", "자연경관", "사진맛집"],
  "쑥섬 (애도)": ["감성적인", "조용한", "부모님과", "바다뷰", "자연경관"],
  "연홍도": ["감성적인", "고즈넉한", "혼자", "사진맛집", "걷기좋은"],
  "낙화암 (부소산성)": ["고즈넉한", "웅장한", "부모님과", "역사탐방", "자연경관"],
  "무량사": ["조용한", "고즈넉한", "혼자", "역사탐방", "걷기좋은"],
  "모운동 벽화마을": ["감성적인", "조용한", "친구와", "걷기좋은", "사진맛집"],
  "나로도 편백숲": ["조용한", "신비로운", "부모님과", "자연경관", "걷기좋은"],
  "반교리 돌담길": ["고즈넉한", "감성적인", "커플", "걷기좋은", "사진맛집"],
  "고흥 우주발사전망대 해안길": ["웅장한", "낭만적인", "커플", "바다뷰", "노을맛집"]
};

// CourseItem Component to handle drag controls and memo edit
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CourseItem({ 
  place, 
  index, 
  selectedPlaceId, 
  setSelectedPlaceId, 
  saveMemoToState
}: any) {
  const controls = useDragControls();
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memo, setMemo] = useState(place.memo || "");

  // Reset memo state if place.memo changes externally
  useEffect(() => {
    setMemo(place.memo || "");
  }, [place.memo]);

  const handleSaveMemo = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsEditingMemo(false);
    saveMemoToState(place.id, memo);
  };

  return (
    <Reorder.Item
      value={place}
      id={String(place.id)}
      dragListener={false}
      dragControls={controls}
      className={`relative rounded-3xl transition-all mb-3 overflow-hidden ${
        selectedPlaceId === place.id 
          ? "bg-brand-red/5 dark:bg-brand-red/10 ring-1 ring-brand-red/20" 
          : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
      }`}
    >
      <div 
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={(e) => {
          // Prevent selecting when clicking input/buttons
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          setSelectedPlaceId(place.id);
        }}
      >
        <div className="relative flex-shrink-0 mt-1">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-lg font-black text-gray-400 dark:text-gray-600">
            {index + 1}
          </div>
          {selectedPlaceId === place.id && (
            <motion.div 
              layoutId="active-indicator"
              className="absolute -left-1.5 top-1/4 w-1 h-1/2 bg-brand-red rounded-full"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-2">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{place.name}</h4>
              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{place.desc}</p>
            </div>
            <span className="text-[10px] font-black text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {place.duration}
            </span>
          </div>
          
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {place.tags.map((tag: string, idx: number) => (
                <span key={idx} className="inline-flex items-center rounded-full bg-brand-red/10 text-brand-red px-2 py-0.5 text-[10px] font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Memo Section */}
          <div className="mt-3">
            {isEditingMemo ? (
              <form onSubmit={handleSaveMemo} className="flex items-center gap-2">
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 남겨보세요"
                  className="flex-1 text-[12px] bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-red text-gray-900 dark:text-white"
                  autoFocus
                  onBlur={() => handleSaveMemo()}
                />
              </form>
            ) : (
              <div className="flex items-start gap-2 group/memo min-h-[24px]">
                {place.memo ? (
                  <p 
                    className="text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-snug flex-1 cursor-text"
                    onClick={() => setIsEditingMemo(true)}
                  >
                    {place.memo}
                  </p>
                ) : (
                  <p 
                    className="text-[12px] text-gray-300 dark:text-gray-600 font-medium flex-1 cursor-text flex items-center gap-1 opacity-0 group-hover/memo:opacity-100 transition-opacity" 
                    onClick={() => setIsEditingMemo(true)}
                  >
                    <Edit3 size={12} /> 메모 추가
                  </p>
                )}
                {place.memo && (
                  <button 
                    onClick={() => setIsEditingMemo(true)} 
                    className="text-gray-300 hover:text-brand-red transition-colors opacity-0 group-hover/memo:opacity-100"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drag Handle */}
        <div 
          className="flex flex-col items-center justify-center pt-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors ml-1"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical size={20} />
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function CourseMap() {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const recommendations = useRecommendationStore((state) => state.recommendations);
  const setRecommendations = useRecommendationStore((state) => state.setRecommendations);
  const tripTitle = useRecommendationStore((state) => state.tripTitle);

  const [places, setPlaces] = useState<any[]>([]);

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      // eslint-disable-next-line
      setPlaces(recommendations.map((p, idx) => {
        const dbTags = DB_PLACE_TAGS[p.name];
        return {
          id: p.name + p.lat + idx, // Unique string id for Reorder
          name: p.name,
          desc: p.desc || p.type || "AI 추천 장소",
          duration: p.duration || "예정",
          lat: p.lat,
          lng: p.lng,
          tags: dbTags && dbTags.length > 0 ? dbTags : (p.tags && p.tags.length > 0 ? p.tags : (p.type ? [p.type] : [])),
          memo: p.memo || ""
        };
      }));
    } else {
      setPlaces([
        { 
          id: "place-1", 
          name: "성흥산성 사랑나무", 
          desc: "인생샷 명소로 유명한 탁 트인 언덕",
          duration: "1h 30m",
          lat: 36.1950,
          lng: 126.9038,
          tags: ["인스타핫플", "숨은명소"],
          memo: ""
        },
        { 
          id: "place-2", 
          name: "부여 중앙시장", 
          desc: "점심 식사 및 현지 간식 탐방",
          duration: "1h 00m",
          lat: 36.2798,
          lng: 126.9140,
          tags: ["축제중"],
          memo: ""
        },
        { 
          id: "place-3", 
          name: "궁남지 야경", 
          desc: "은은한 조명이 예쁜 산책로 마무~리",
          duration: "45m",
          lat: 36.2748,
          lng: 126.9142,
          tags: ["숨은명소"],
          memo: "야경 사진 꼭 찍기!"
        },
      ]);
    }
  }, [recommendations]); // Re-sync if store changes externally

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveToStore = (currentPlaces: any[]) => {
    const newRecs: RecommendedPlace[] = currentPlaces.map((p, idx) => ({
      order: idx + 1,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      type: p.desc,
      desc: p.desc,
      duration: p.duration,
      tags: p.tags,
      memo: p.memo
    }));
    setRecommendations(newRecs, tripTitle);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleReorder = (newOrder: any[]) => {
    setPlaces(newOrder);
    saveToStore(newOrder);
  };

  const saveMemoToState = (placeId: string | number, newMemo: string) => {
    const newPlaces = places.map(p => 
      p.id === placeId ? { ...p, memo: newMemo } : p
    );
    setPlaces(newPlaces);
    saveToStore(newPlaces);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20 transition-colors duration-300">
      <header className="p-5 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-full shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">MY PLAYLIST</h1>
        <button className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-full shadow-sm">
          <Share2 size={20} />
        </button>
      </header>

      <main className="flex-1 px-5">
        <div className="sticky top-0 z-20 pt-2 pb-6 bg-[#F8F9FA] dark:bg-gray-950 -mx-5 px-5">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] overflow-hidden shadow-xl shadow-brand-red/10 border border-white dark:border-gray-800"
          >
            {places.length > 0 ? (
              <MapClient itinerary={places} selectedPlaceId={selectedPlaceId} resetTrigger={resetTrigger} />
            ) : (
              <div className="h-[280px] w-full bg-gray-100 flex items-center justify-center text-gray-400">지도 로딩 중...</div>
            )}
          </motion.div>
        </div>

        <section className="mb-6 relative group">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
              {recommendations.length > 0 ? tripTitle : "부여 감성 당일치기"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1 text-brand-red">
                <Music size={14} fill="currentColor" />
                <span>AI Recommended</span>
              </div>
              <span>•</span>
              <span>{places.length} spots</span>
              <span>•</span>
              <span>{places.some(p => p.duration !== "예정") ? "계획됨" : "시간 미정"}</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Track List</h3>
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-brand-red transition-colors"><Shuffle size={18} /></button>
              <button 
                onClick={() => {
                  setSelectedPlaceId(null);
                  setResetTrigger(prev => prev + 1);
                }}
                className="w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-red/30"
                title="전체 코스 보기"
              >
                <Play size={14} fill="currentColor" />
              </button>
            </div>
          </div>

          <Reorder.Group 
            axis="y" 
            values={places} 
            onReorder={handleReorder}
            className="space-y-3"
          >
            {places.map((place, index) => (
              <CourseItem 
                key={place.id}
                place={place}
                index={index}
                selectedPlaceId={selectedPlaceId}
                setSelectedPlaceId={setSelectedPlaceId}
                saveMemoToState={saveMemoToState}
              />
            ))}
          </Reorder.Group>
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
