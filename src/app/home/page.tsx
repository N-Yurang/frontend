"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Flame } from "lucide-react";
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
  { id: 1, title: "제주 들불축제", image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 2, title: "진해 군항제", image: "https://images.unsplash.com/photo-1617180236048-bdabae82e2ec?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 3, title: "에버랜드 장미축제", image: "https://images.unsplash.com/photo-1554559388-755cc8bd75a9?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 4, title: "부산 불꽃축제", image: "https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 5, title: "여의도 벚꽃축제", image: "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&q=80&w=400&h=300" }
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
    badge: "천만 영화 트렌드",
    title: "'왕의 남자' 촬영지!\n새롭게 뜨는 여행지 영월",
    image: "https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 102,
    badge: "인기 예능 등장",
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
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-2 bg-white sticky top-0 z-10">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-xl font-black text-brand-red tracking-widest">
            TRIPLY
          </h1>
        </div>

        <div className="relative mb-2 flex items-center h-[46px] bg-gray-100 rounded-full focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-red transition-all">
          <div className="absolute left-4 flex items-center pointer-events-none z-10">
            <Search className="h-5 w-5 text-gray-400" />
          </div>

          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full h-full pl-11 pr-4 bg-transparent border-transparent text-[15px] font-medium outline-none z-10 relative"
          />

          {!isFocused && !searchValue && (
            <div className="absolute inset-y-0 left-11 right-4 flex items-center pointer-events-none overflow-hidden">
              <AnimatePresence>
                <motion.div
                  key={placeholderIndex}
                  initial={{ y: 25, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -25, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="text-[15px] text-gray-400 font-medium absolute w-full truncate"
                >
                  {SEARCH_PLACEHOLDERS[placeholderIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      {/* Media Trend Destinations */}
      <section className="mt-4 px-5">
        <h2 className="flex items-center text-lg font-bold text-gray-900 mb-4 gap-1.5">
          <span className="text-xl">🔥</span> 지금 뜨는 미디어 속 여행지
        </h2>
        <div className="flex flex-col gap-4">
          {TRENDING_MEDIA.map((item) => (
            <div key={item.id} className="relative w-full h-56 rounded-2xl overflow-hidden cursor-pointer group shadow-sm">
              <Image
                src={item.image}
                alt="Trend"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 480px) 100vw, 480px"
              />
              {/* Gradient Overlay for Text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="inline-block bg-brand-red text-white text-[11px] font-bold px-2.5 py-1 rounded-full mb-2">
                  {item.badge}
                </span>
                <h3 className="font-bold text-lg leading-tight whitespace-pre-line">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hidden Destinations */}
      <section className="mt-8 px-5">
        <h2 className="flex items-center text-lg font-bold text-gray-900 mb-4 gap-1.5">
          <span className="text-xl">🌿</span> 숨은 여행지
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {HIDDEN_DESTINATIONS.map((item) => (
            <div key={item.id} className="group cursor-pointer">
              <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-2 shadow-sm bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 480px) 50vw, 25vw"
                />
              </div>
              <h3 className="font-bold text-gray-800 text-[14px] leading-tight mb-0.5">{item.title}</h3>
              <p className="text-[12px] text-gray-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> {item.location}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Festivals */}
      <section className="mt-8 px-5">
        <h2 className="flex items-center text-lg font-bold text-gray-900 mb-4 gap-1.5">
          <span className="text-gray-400">📅</span> 이달의 축제 (3월)
        </h2>
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-5 px-5">
          {FESTIVALS.map((item) => (
            <div key={item.id} className="min-w-[140px] flex-shrink-0 group cursor-pointer">
              <div className="relative h-36 w-full rounded-2xl overflow-hidden mb-2 shadow-sm bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 480px) 50vw, 33vw"
                />
              </div>
              <h3 className="font-semibold text-gray-800 text-[14px] text-center">{item.title}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
