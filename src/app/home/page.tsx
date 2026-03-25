import { Search, MapPin, Calendar, Flame } from "lucide-react";
import Image from "next/image";

const FESTIVALS = [
  { id: 1, title: "제주 들불축제", image: "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 2, title: "진해 군항제", image: "https://images.unsplash.com/photo-1617180236048-bdabae82e2ec?auto=format&fit=crop&q=80&w=400&h=300" },
  { id: 3, title: "에버랜드 장미축제", image: "https://images.unsplash.com/photo-1554559388-755cc8bd75a9?auto=format&fit=crop&q=80&w=400&h=300" },
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
  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-2 bg-white sticky top-0 z-10">
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-xl font-black text-brand-red tracking-widest">
            TRIPLY
          </h1>
        </div>

        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-gray-100 border-transparent rounded-full text-[15px] focus:border-brand-red focus:bg-white focus:ring-1 focus:ring-brand-red font-medium transition-all outline-none"
            placeholder="어디로 떠나볼까요? (예: 영월)"
          />
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

      {/* Monthly Festivals */}
      <section className="mt-8 px-5">
        <h2 className="flex items-center text-lg font-bold text-gray-900 mb-4 gap-1.5">
          <span className="text-gray-400">📅</span> 이달의 축제 (3월)
        </h2>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide -mx-5 px-5">
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
