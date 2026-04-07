"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Flame, Compass, Mic, Play, MoreHorizontal, Info } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const SEARCH_PLACEHOLDERS = [
  "어디로 떠나볼까요? (예: 영월)",
  "바다 냄새 물씬 나는 오션뷰 명소",
  "드라마 발자취 따라가기",
  "지금 가장 핫한 촬영지 TOP5",
  "야경이 가장 아름다운 숨은 아지트",
  "오늘 본 드라마 속 그 골목, 실제로 걸어볼까요?",
  "엔딩 크레딧이 올라가면 시작되는 당신만의 여행",
];


export default function Home() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [trendIndex, setTrendIndex] = useState(0);

  const currentMonth = new Date().getMonth() + 1;
  const [festivals, setFestivals] = useState([]);
  const [trendingPlaces, setTrendingPlaces] = useState([]);
  const [hiddenPlaces, setHiddenPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`http://localhost:5001/api/festivals?month=${currentMonth}`).then(res => res.json()),
      fetch("http://localhost:5001/api/places/trends").then(res => res.json()),
      fetch("http://localhost:5001/api/places/hidden").then(res => res.json())
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
            <div
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4"
              onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                const index = Math.round(target.scrollLeft / target.offsetWidth);
                if (index !== trendIndex) setTrendIndex(index);
              }}
            >
              {isLoading ? (
                <div className="min-w-full w-full flex-shrink-0 snap-center pb-2">
                  <div className="w-full h-64 rounded-[32px] bg-gray-200 dark:bg-gray-800 animate-pulse shadow-xl shadow-gray-200/50 dark:shadow-none" />
                </div>
              ) : (
                trendingPlaces.map((item: any, idx: number) => {
                  return (
                    <div key={item.place_id} className="min-w-full w-full flex-shrink-0 snap-center pb-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative w-full h-64 rounded-[32px] overflow-hidden cursor-pointer group shadow-xl shadow-gray-200/50 dark:shadow-none bg-gray-100 dark:bg-gray-800"
                      >
                        {/* ✅ 수정 START ================================ */}
                        {/* 1. src: http:// 중복 방지 위해 startsWith('http') 체크 추가 */}
                        {/* 2. className: absolute inset-0 추가 → 이미지가 컨테이너를 꽉 채우도록 수정 */}
                        <img
                          src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:5001${item.image_url}`}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        />
                        {/* ✅ 수정 END ================================== */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

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
                      </motion.div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Dots Indicator */}
            {!isLoading && trendingPlaces.length > 1 && (
              <div className="flex justify-center items-center gap-1.5 mt-4">
                {trendingPlaces.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === trendIndex ? "bg-brand-red w-5" : "bg-gray-300 dark:bg-gray-700 w-2"
                      }`}
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
              hiddenPlaces.map((item: any, idx: number) => {
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
                      {/* ✅ 수정 START ================================ */}
                      {/* 1. src: http:// 중복 방지 위해 startsWith('http') 체크 추가 */}
                      {/* 2. className: absolute inset-0 추가 → 이미지가 컨테이너를 꽉 채우도록 수정 */}
                      <img
                        src={item.image_url?.startsWith('http') ? item.image_url : `http://localhost:5001${item.image_url}`}
                        alt={item.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* ✅ 수정 END ================================== */}
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
              festivals.map((item: any, idx: number) => {
                const imageUrl = item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `http://localhost:5001${item.image_url}`) : item.image;
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
                      {/* ✅ 수정 START ================================ */}
                      {/* className: absolute inset-0 추가 → 이미지가 컨테이너를 꽉 채우도록 수정 */}
                      <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      {/* ✅ 수정 END ================================== */}
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
    </div>
  );
}
