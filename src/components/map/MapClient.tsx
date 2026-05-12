"use client";

import { useEffect, useState } from "react";
import { Map, CustomOverlayMap, Polyline } from "react-kakao-maps-sdk";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kakao: any;
  }
}

interface Place {
  id: number;
  name: string;
  lat: number;
  lng: number;
  tags?: string[];
}

interface MapClientProps {
  itinerary: Place[];
}

export default function MapClient({ itinerary }: MapClientProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // 자동 범위 조절 (Auto Bounds)
  useEffect(() => {
    if (!map || itinerary.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    itinerary.forEach((place) => {
      bounds.extend(new window.kakao.maps.LatLng(place.lat, place.lng));
    });

    map.setBounds(bounds);
  }, [map, itinerary]);

  return (
    <Map
      center={{ lat: 36.2748, lng: 126.9142 }}
      style={{ width: "100%", height: "400px" }}
      level={5}
      onCreate={setMap}
    >
      {/* 1. 숫자 마커 (Numbered Markers) */}
      {itinerary.map((place, index) => (
        <CustomOverlayMap
          key={`marker-${place.id}`}
          position={{ lat: place.lat, lng: place.lng }}
          yAnchor={0.5}
        >
          <div 
            className="relative flex flex-col items-center"
            onMouseEnter={() => setHoveredId(place.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* 숫자 원형 마커 */}
            <div className="w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white text-sm cursor-pointer hover:scale-110 transition-transform">
              {index + 1}
            </div>

            {/* 배지 (태그들) - 왼쪽/오른쪽 번갈아 배치 */}
            {place.tags && place.tags.length > 0 && (
              <div className={`absolute top-1/2 -translate-y-1/2 flex flex-col gap-1 ${index % 2 === 0 ? 'right-full mr-3' : 'left-full ml-3'} pointer-events-none`}>
                {place.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-[9px] font-bold bg-white/50 text-brand-red px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-md border border-white/70">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 호버 시 나타나는 장소명 라벨 */}
            {hoveredId === place.id && (
              <div className="absolute bottom-full mb-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold whitespace-nowrap animate-in fade-in zoom-in duration-200">
                {place.name}
                {/* 말풍선 꼬리 */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
              </div>
            )}
          </div>
        </CustomOverlayMap>
      ))}

      {/* 2. 폴리라인 (Polyline) */}
      <Polyline
        path={itinerary.map((p) => ({ lat: p.lat, lng: p.lng }))}
        strokeWeight={4}
        strokeColor="#FF5733"
        strokeOpacity={0.8}
        strokeStyle="solid"
      />
    </Map>
  );
}
