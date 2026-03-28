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

const FESTIVALS = [
  { id: 1, title: "제주 들불축제", date: "03.08-03.11", image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 2, title: "진해 군항제", date: "03.25-04.03", image: "https://images.unsplash.com/photo-1617180236048-bdabae82e2ec?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 3, title: "에버랜드 장미축제", date: "03.15-06.11", image: "https://images.unsplash.com/photo-1554559388-755cc8bd75a9?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 4, title: "부산 불꽃축제", date: "03.20", image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 5, title: "여의도 벚꽃축제", date: "03.28-04.02", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=400&h=300" }
];

const HIDDEN_DESTINATIONS = [
  { id: 201, title: "비밀의 숲 안돌오름", location: "제주 구좌읍", image: "https://images.unsplash.com/photo-1521742617637-268e37130dfc?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 202, title: "수로부인 헌화공원", location: "강원 삼척", image: "https://images.unsplash.com/photo-1588614486676-e1f9a2fbde64?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 203, title: "다랭이마을 계단식 논", location: "경남 남해", image: "https://images.unsplash.com/photo-1617180236048-bdabae82e2ec?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 204, title: "벌교 갯벌", location: "전남 보성", image: "https://images.unsplash.com/photo-1612458428172-23c58cc440d4?auto=format&fit=crop&q=80&w=400&h=300" }
];

const TRENDING_MEDIA = [
  {
    id: 101,
    badge: "MOVIE TREND",
    title: "'왕의 남자' 촬영지!\n새롭게 뜨는 여행지 영월",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 102,
    badge: "VARIETY SHOW",
    title: "힐링 예능 촬영지,\n숨은 낭만 고흥으로 떠나요",
    image: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
  },
];

export default function Home() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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

        <div className="relative flex items-center h-[52px] bg-[#f8f9fb] dark:bg-gray-900 border border-transparent focus-within:border-brand-red/30 rounded-2xl focus-within:bg-white dark:focus-within:bg-gray-950 shadow-sm transition-all group">
          <div className="absolute left-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-red transition-colors" />
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
          
          <div className="space-y-6">
            {TRENDING_MEDIA.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative w-full h-64 rounded-[32px] overflow-hidden cursor-pointer group shadow-xl shadow-gray-200/50 dark:shadow-none bg-gray-100 dark:bg-gray-800"
              >
                <Image
                  src={item.image}
                  alt="Trend"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  sizes="(max-width: 480px) 100vw, 480px"
                />
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
                      {item.badge}
                    </span>
                    <h3 className="font-black text-xl leading-tight whitespace-pre-line group-hover:text-brand-red transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Hidden Destinations */}
        <section className="mt-12 py-10 bg-gray-50/50 dark:bg-gray-900/30 border-y border-gray-100 dark:border-gray-800 transition-colors">
          <div className="px-5 mb-6">
            <h2 className="flex items-center text-lg font-bold text-gray-900 dark:text-gray-100 gap-2 mb-1">
              <Compass className="w-5 h-5 text-teal-500" />
              <span>숨은 여행지</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">아직 많이 알려지지 않은 보석 같은 장소들</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 px-5">
            {HIDDEN_DESTINATIONS.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative h-44 w-full rounded-3xl overflow-hidden mb-3 shadow-md bg-gray-100 dark:bg-gray-800 transition-all group-hover:shadow-xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 480px) 50vw, 25vw"
                  />
                  {/* Small Play Indicator */}
                  <div className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={14} className="text-white fill-white ml-0.5" />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[14px] px-1 truncate transition-colors">{item.title}</h3>
                <div className="flex items-center justify-between px-1 mt-1">
                  <p className="text-[11px] text-gray-400 flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-brand-red" /> {item.location}
                  </p>
                  <button className="text-gray-300 hover:text-gray-900 dark:hover:text-white">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Monthly Festivals */}
        <section className="mt-8 px-5 pb-12">
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
            {FESTIVALS.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="min-w-[160px] flex-shrink-0 group cursor-pointer"
              >
                <div className="relative h-40 w-full rounded-3xl overflow-hidden mb-3 shadow-lg bg-gray-100 dark:bg-gray-800 transition-all border border-gray-100 dark:border-gray-800 group-hover:border-brand-red/30">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 480px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 px-2 py-1 rounded-lg text-[10px] font-black text-gray-900 dark:text-white transition-colors">
                    D-DAY
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[14px] mb-0.5 transition-colors">{item.title}</h3>
                <p className="text-[11px] text-gray-400 font-medium">{item.date}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
