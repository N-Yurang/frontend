"use client";

import { useEffect, useState } from "react";
import { useKakaoLoader, Map, CustomOverlayMap, Polyline } from "react-kakao-maps-sdk";

declare global {
  interface Window {
    kakao: any;
  }
}

interface PlaceInfo {
  id: number;
  name: string;
  desc: string;
  duration: string;
  lat: number;
  lng: number;
}

interface MapClientProps {
  places: PlaceInfo[];
  selectedPlaceId: number | null;
}

export default function MapClient({ places, selectedPlaceId }: MapClientProps) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_APP_KEY as string, 
  });

  // kakao.maps.Map 타입을 사용해야 하지만 개발 환경에서 글로벌 타입 충돌 방지를 위해 any 허용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    // 선택된 장소로 지도 부드럽게 이동
    if (map && selectedPlaceId && window.kakao && window.kakao.maps) {
      const selected = places.find((p) => p.id === selectedPlaceId);
      if (selected) {
        const moveLatLon = new window.kakao.maps.LatLng(selected.lat, selected.lng);
        map.panTo(moveLatLon);
      }
    }
  }, [map, selectedPlaceId, places]);

  if (loading) return <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400 text-sm font-bold">카카오맵 로드 중...</div>;
  if (error) return <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-red-50 text-brand-red text-sm font-bold">카카오맵 로드 실패!<br />.env.local 파일의 키와 도메인 일치 여부를 확인하세요.</div>;

  const defaultCenter = places.length > 0
    ? { lat: places[0].lat, lng: places[0].lng }
    : { lat: 36.2798, lng: 126.9140 };

  const polylinePath = places.map((p) => ({ lat: p.lat, lng: p.lng }));

  return (
    <div className="w-full h-full relative z-0 rounded-3xl overflow-hidden">
      <Map
        center={defaultCenter}
        className="w-full h-full"
        level={4} // 확대 레벨 (작을수록 확대)
        onCreate={setMap}
        isPanto={true}
      >
        {places.map((place) => (
          <CustomOverlayMap
            key={place.id}
            position={{ lat: place.lat, lng: place.lng }}
            yAnchor={1} // y 커스텀오버레이 기준점 (0 완전 위, 1 완전 아래)
          >
            {/* Custom Pulse Marker & Premium Popup */}
            <div className="relative group pb-6 flex flex-col items-center hover:z-[999] cursor-pointer">
              
              {/* Premium Popup Box */}
              <div className="absolute bottom-full mb-1 bg-white dark:bg-gray-800 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-black/5 dark:border-white/10 p-3 min-w-[140px] opacity-100 transition-opacity whitespace-nowrap">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[14px] leading-tight mb-1">{place.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mb-2 truncate max-w-[150px]">{place.desc}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-brand-red uppercase">추천 머무는 시간</span>
                  <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{place.duration}</span>
                </div>
                {/* Triangle Tail */}
                <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-r border-b border-black/5 dark:border-white/10"></div>
              </div>

              {/* Pulse Marker Indicator */}
              <div className="relative flex items-center justify-center w-6 h-6">
                <div className="absolute w-full h-full bg-brand-red rounded-full opacity-40 animate-ping"></div>
                <div className="relative w-3 h-3 bg-brand-red rounded-full border-2 border-white shadow-md"></div>
              </div>

            </div>
          </CustomOverlayMap>
        ))}

        {/* 연결 동선 그리기 (점선) */}
        {polylinePath.length > 1 && (
          <Polyline
            path={polylinePath}
            strokeWeight={3}
            strokeColor="#ef4444"
            strokeOpacity={0.6}
            strokeStyle="shortdash"
          />
        )}
      </Map>
    </div>
  );
}
