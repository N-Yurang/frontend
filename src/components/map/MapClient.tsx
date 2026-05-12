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
