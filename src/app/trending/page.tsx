"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Search, Heart, MapPin, Navigation, ChevronRight, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { normalizeTags } from "@/utils/tagGrouper";

interface Place {
  place_id: number;
  name: string;
  location: string;
  image_url: string;
  media_source?: string;
  tags?: string[];
}

export default function TrendingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("드라마 속 그곳");

  const tabs = ["드라마 속 그곳", "예능 촬영지", "영화 속 장소"];

  const [trendPlaces, setTrendPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/places/trends`)
      .then(res => res.json())
      .then(data => {
        if (data && data.status === "success") {
          setTrendPlaces(data.data.places);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPlaces = trendPlaces.filter((place) => {
    if (!place.media_source) return false;
    if (activeTab === "드라마 속 그곳") return place.media_source.includes("드라마");
    if (activeTab === "예능 촬영지") return place.media_source.includes("예능");
    if (activeTab === "영화 속 장소") return place.media_source.includes("영화");
    return true;
  });
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F4F0] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-[#E8E7E2] px-5 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-[#2C2C2A] hover:text-brand-red transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[17px] font-semibold text-[#2C2C2A]">
          트렌드 여행지
        </h1>
        <button className="text-[#2C2C2A] hover:text-brand-red transition-colors">
          <Search size={22} />
        </button>
      </header>

      {/* Tabs */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-[#E8E7E2] flex items-center">
        <div className="flex w-full">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[14px] font-semibold relative transition-colors text-center ${activeTab === tab ? "text-[#FA5252]" : "text-[#B4B2A9] font-normal"
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#FA5252] rounded-t-sm" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6 flex flex-col gap-5">
        {isLoading ? (
          <div className="flex justify-center items-center py-20 text-[#B4B2A9]">
            불러오는 중...
          </div>
        ) : filteredPlaces.length === 0 ? (
          <div className="flex justify-center items-center py-20 text-[#B4B2A9]">
            해당하는 장소가 없습니다.
          </div>
        ) : filteredPlaces.map((place) => (
          <Link href={`/place/${place.place_id}`} key={place.place_id} className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(44,44,42,0.08)] overflow-hidden flex flex-col block">
            {/* Image Section */}
            <div className="relative w-full h-[180px] bg-gray-200">
              <img
                src={place.image_url?.startsWith('http') ? place.image_url : `${process.env.NEXT_PUBLIC_API_URL}${place.image_url}`}
                alt={place.name}
                className="w-full h-full object-cover"
              />

              {/* Media Source Badge */}
              <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <Tv size={14} className="text-white" />
                <span className="text-white text-[12px]">{place.media_source || "미디어 명소"}</span>
              </div>

              {/* Heart Button */}
              <button
                onClick={(e) => e.preventDefault()}
                className="absolute top-3 right-3 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <Heart size={16} className="text-white" />
              </button>
            </div>

            {/* Info Section */}
            <div className="p-4 flex flex-col">
              <h3 className="text-[17px] font-bold text-[#2C2C2A]">{place.name || place.location}</h3>

              <div className="flex items-center gap-1 mt-1">
                <MapPin size={14} className="text-[#FA5252]" />
                <span className="text-[13px] text-[#6B6A65]">{place.location}</span>
              </div>

              <div className="mt-2 text-[12px] text-[#B4B2A9]">
                {place.tags ? normalizeTags(place.tags).map((t: string) => `#${t}`).join("  ") : ""}
              </div>

              <div className="w-full h-[1px] bg-[#E8E7E2] my-4" />

              <button
                onClick={(e) => { e.preventDefault(); router.push('/chat'); }}
                className="w-full h-11 bg-gradient-to-br from-[#FA5252] to-[#FF8E73] rounded-xl flex items-center justify-center gap-2 text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
              >
                <Navigation size={18} className="fill-white" />
                이걸로 코스 짜기
                <ChevronRight size={16} />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
