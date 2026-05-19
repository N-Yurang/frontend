"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Calendar, Flame, Compass, Mic, Play, MoreHorizontal, Info, Heart, Bell } from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import NotificationSheet from "@/components/ui/NotificationSheet";

const SEARCH_PLACEHOLDERS = [
  "어디로 떠나볼까요? (예: 영월)",
  "바다 냄새 물씬 나는 오션뷰 명소",
  "드라마 발자취 따라가기",
  "지금 가장 핫한 촬영지 TOP5",
  "야경이 가장 아름다운 숨은 아지트",
  "오늘 본 드라마 속 그 골목, 실제로 걸어볼까요?",
  "엔딩 크레딧이 올라가면 시작되는 당신만의 여행",
];

interface Festival {
  festival_id?: number;
  id?: number;
  name?: string;
  title?: string;
  start_date?: string;
  end_date?: string;
  image_url?: string;
  image?: string;
  date?: string;
}

interface Place {
  place_id: number;
  name: string;
  location: string;
  image_url: string;
  media_source?: string;
}

export default function Home() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [trendIndex, setTrendIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('targetTouches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
    setTouchEnd(0);
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ('targetTouches' in e) {
      setTouchEnd(e.targetTouches[0].clientX);
    } else {
      setTouchEnd((e as React.MouseEvent).clientX);
    }
  };

  const handleDragEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    
    // 왼쪽으로 스와이프 (다음)
    if (distance > 50) {
      setIsTransitioning(true);
      setTrendIndex((prev) => {
        if (prev >= trendingPlaces.length) return prev;
        return prev + 1;
      });
    } 
    // 오른쪽으로 스와이프 (이전)
    else if (distance < -50) {
      setIsTransitioning(true);
      setTrendIndex((prev) => (prev <= 0 ? trendingPlaces.length - 1 : prev - 1));
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const currentMonth = new Date().getMonth() + 1;
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
  const [hiddenPlaces, setHiddenPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedItems((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
      } else {
        newLiked.add(id);
      }
      return newLiked;
    });
  };

  useEffect(() => {
    const container = sliderContainerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // 트랙패드 좌우 스와이프 감지
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault(); // 웹 브라우저의 기본 스와이프 뒤로가기/앞으로가기 방지

        if (Math.abs(e.deltaX) > 15) {
          if (wheelTimeout.current) return;
          
          if (e.deltaX > 0) {
            setIsTransitioning(true);
            setTrendIndex((prev) => {
              if (prev >= trendingPlaces.length) return prev;
              return prev + 1;
            });
          } else {
            setIsTransitioning(true);
            setTrendIndex((prev) => (prev <= 0 ? trendingPlaces.length - 1 : prev - 1));
          }
          
          wheelTimeout.current = setTimeout(() => {
            wheelTimeout.current = null;
          }, 600);
        }
      }
    };

    // passive: false로 이벤트를 등록해야 preventDefault()가 동작함
    container.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleNativeWheel);
  }, [trendingPlaces.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/festivals?month=${currentMonth}`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places/trends`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places/hidden`).then(res => res.json())
    ])
      .then(([festivalsData, trendsData, hiddenData]) => {
        if (festivalsData && festivalsData.status === "success") setFestivals(festivalsData.data.festivals);
        if (trendsData && trendsData.status === "success") setTrendingPlaces(trendsData.data.places);
        if (hiddenData && hiddenData.status === "success") setHiddenPlaces(hiddenData.data.places);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentMonth]);

  // 2초마다 미디어 속 여행지 자동 슬라이드
  useEffect(() => {
    if (isLoading || trendingPlaces.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTrendIndex((prev) => {
        if (prev >= trendingPlaces.length) return prev;
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading, trendingPlaces.length, isHovered]);

  // 무한 루프: 마지막 카드(클론)에 도달하면 애니메이션 없이 실제 첫 카드로 이동
  useEffect(() => {
    if (trendIndex === trendingPlaces.length && trendingPlaces.length > 0) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false); // 애니메이션 끄기
        setTrendIndex(0); // 실제 첫 번째 인덱스로 이동
        
        // 브라우저 렌더링 후 다시 애니메이션 켜기
        setTimeout(() => setIsTransitioning(true), 50);
      }, 700); // CSS transition duration (700ms)과 동일하게 설정
      return () => clearTimeout(timeout);
    }
  }, [trendIndex, trendingPlaces.length]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="px-5 pt-3 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-10 transition-colors duration-300 border-b border-gray-50 dark:border-gray-900">
        <div className="flex justify-between items-center mb-5">
          <div className="w-10" /> {/* Spacer for centering logo */}
          <h1 className="text-xl font-black text-brand-red tracking-widest">
            TRIPLY
          </h1>
          <div className="flex gap-3 w-10 justify-end">
            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors relative" onClick={() => setIsNotificationOpen(true)}>
              <Bell size={20} />
              {/* Unread indicator */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF4B4B] rounded-full border-2 border-white dark:border-gray-950"></span>
            </button>
            <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center h-[52px] bg-white dark:bg-gray-950 border border-brand-red/30 rounded-2xl shadow-sm transition-all group">
          <div className="absolute left-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-brand-red transition-colors" />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-full pl-11 pr-12 bg-transparent border-transparent text-[15px] font-medium outline-none z-10 relative dark:text-white"
          />

          <div className="absolute right-4 z-10">
            <Mic className="h-5 w-5 text-gray-400 hover:text-brand-red cursor-pointer transition-colors" />
          </div>

          {!isFocused && !searchValue && (
            <div className="absolute inset-y-0 left-11 right-12 flex items-center pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={placeholderIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-[14px] text-gray-400 font-medium absolute w-full truncate"
                >
                  {SEARCH_PLACEHOLDERS[placeholderIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Media Trend Destinations */}
        <section className="mt-8 px-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center text-lg font-bold text-gray-900 dark:text-gray-100 gap-2 transition-colors">
              <Flame className="w-5 h-5 text-brand-red fill-brand-red/20" />
              <span>지금 뜨는 미디어 속 여행지</span>
            </h2>
            <button className="text-xs font-bold text-gray-400 hover:text-brand-red">SEE ALL</button>
          </div>

          <div className="relative">
            {/* 슬라이더 컨테이너: overflow-hidden + translateX로 부드럽게 전환 */}
            <div 
              ref={sliderContainerRef}
              className="overflow-hidden rounded-[32px] pb-2 cursor-grab active:cursor-grabbing"
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onMouseDown={handleDragStart}
              onMouseMove={(e) => touchStart !== 0 && handleDragMove(e)}
              onMouseUp={handleDragEnd}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                handleDragEnd();
              }}
            >
              {isLoading ? (
                <div className="w-full h-64 rounded-[32px] bg-gray-200 dark:bg-gray-800 animate-pulse shadow-xl shadow-gray-200/50 dark:shadow-none" />
              ) : (
                <div
                  className={`flex gap-4 ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
                  style={{ transform: `translateX(calc(-${trendIndex * 100}% - ${trendIndex}rem))` }}
                >
                  {(trendingPlaces.length > 0 ? [...trendingPlaces, trendingPlaces[0]] : []).map((item: Place, idx) => (
                    <div key={`${item.place_id}-${idx}`} className="min-w-full flex-shrink-0">
                      <div className="relative w-full h-64 rounded-[32px] overflow-hidden cursor-pointer group shadow-xl shadow-gray-200/50 dark:shadow-none bg-gray-100 dark:bg-gray-800">
                        <img
                          src={item.image_url?.startsWith('http') ? item.image_url : `${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        
                        {/* Like Button */}
                        <button
                          onClick={(e) => toggleLike(e, `place-${item.place_id}`)}
                          className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:bg-white/40 active:scale-95"
                        >
                          <Heart
                            size={20}
                            className={`transition-colors ${likedItems.has(`place-${item.place_id}`) ? "text-brand-red fill-brand-red" : "text-white"}`}
                          />
                        </button>

                        {/* Play Button Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                            <Play size={32} className="text-white fill-white ml-1" />
                          </div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <div className="flex flex-col gap-2">
                            <span className="inline-block w-fit bg-brand-red px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                              {item.media_source}
                            </span>
                            <h3 className="font-black text-xl leading-tight whitespace-pre-line group-hover:text-brand-red transition-colors">
                              {item.location}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dots Indicator */}
            {!isLoading && trendingPlaces.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-4">
                {trendingPlaces.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === (trendIndex % trendingPlaces.length) ? "bg-brand-red w-5" : "bg-gray-300 dark:bg-gray-700 w-2"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Hidden Destinations */}
        <section className="mt-8 py-8 bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex items-center justify-between px-5 mb-6">
            <div>
              <h2 className="flex items-center text-lg font-bold text-gray-900 dark:text-gray-100 gap-2 mb-1">
                <Compass className="w-5 h-5 text-teal-500" />
                <span>숨은 여행지</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">아직 많이 알려지지 않은 보석 같은 장소들</p>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-5 pb-4 px-5 scrollbar-hide">
            {isLoading ? (
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="min-w-[160px] w-[calc(50vw-28px)] max-w-[200px] flex-shrink-0 group">
                  <div className="h-44 w-full rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-3" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              ))
            ) : (
              hiddenPlaces.map((item: Place, idx: number) => {
                return (
                  <motion.div
                    key={item.place_id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="min-w-[160px] w-[calc(50vw-28px)] max-w-[200px] flex-shrink-0 group cursor-pointer"
                  >
                    <div className="relative h-44 w-full rounded-3xl overflow-hidden mb-3 shadow-md bg-gray-100 dark:bg-gray-800 transition-all group-hover:shadow-xl">
                      <img
                        src={item.image_url?.startsWith('http') ? item.image_url : `${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Like Button */}
                      <button
                        onClick={(e) => toggleLike(e, `place-${item.place_id}`)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:bg-black/40 active:scale-95"
                      >
                        <Heart
                          size={16}
                          className={`transition-colors ${likedItems.has(`place-${item.place_id}`) ? "text-brand-red fill-brand-red" : "text-white"}`}
                        />
                      </button>

                      {/* Small Play Indicator */}
                      <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play size={14} className="text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[14px] px-1 truncate transition-colors">{item.name}</h3>
                    <div className="flex items-center justify-between px-1 mt-1">
                      <p className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-brand-red" /> {item.location}
                      </p>
                      <button className="text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Monthly Festivals */}
        <section className="mt-6 px-5 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="flex items-center text-lg font-bold text-gray-900 dark:text-gray-100 gap-2 mb-1">
                <Calendar className="w-5 h-5 text-brand-red" />
                <span>이달의 축제 (3월)</span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">다가오는 봄바람과 함께 즐기는 축제들</p>
            </div>
            <button className="text-xs font-bold text-brand-red">03 / 2024</button>
          </div>

          <div className="flex overflow-x-auto gap-5 pb-4 -mx-5 px-5 scrollbar-hide">
            {isLoading ? (
              [...Array(3)].map((_, idx) => (
                <div key={idx} className="min-w-[160px] flex-shrink-0">
                  <div className="h-40 w-full rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse mb-3" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-1.5" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
              ))
            ) : (
              festivals.map((item: Festival, idx: number) => {
                const imageUrl = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`) : item.image;
                const title = item.name || item.title;

                const formatDate = (dateStr: string) => {
                  if (!dateStr) return "";
                  const d = new Date(dateStr);
                  return isNaN(d.getTime()) ? dateStr : `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                };

                const dateStr = item.start_date
                  ? (item.end_date ? `${formatDate(item.start_date)}~${formatDate(item.end_date)}` : formatDate(item.start_date))
                  : item.date;

                return (
                  <motion.div
                    key={item.festival_id || item.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="min-w-[160px] flex-shrink-0 group cursor-pointer"
                  >
                    <div className="relative h-40 w-full rounded-3xl overflow-hidden mb-3 shadow-lg bg-gray-100 dark:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 group-hover:border-brand-red/30">
                      <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />

                      {/* Like Button */}
                      <button
                        onClick={(e) => toggleLike(e, `festival-${item.festival_id || item.id}`)}
                        className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:bg-black/40 active:scale-95"
                      >
                        <Heart
                          size={16}
                          className={`transition-colors ${likedItems.has(`festival-${item.festival_id || item.id}`) ? "text-brand-red fill-brand-red" : "text-white"}`}
                        />
                      </button>

                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-lg text-[10px] font-black text-gray-900 dark:text-white transition-colors">
                        D-DAY
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[14px] mb-0.5 transition-colors">{title}</h3>
                    <p className="text-[11px] text-gray-400 font-medium">{dateStr}</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <NotificationSheet 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  );
}
