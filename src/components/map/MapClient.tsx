"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// 커스텀 마커 아이콘 설정 (기본 이미지 404 에러 방지 및 프리미엄 UI 적용)
const createPulseIcon = () => {
  return L.divIcon({
    className: "custom-pulse-icon",
    html: `
      <div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-full h-full bg-brand-red rounded-full opacity-40 animate-ping"></div>
        <div class="relative w-3 h-3 bg-brand-red rounded-full border-2 border-white shadow-md"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

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
  const [map, setMap] = useState<L.Map | null>(null);

  // 포커스 이동 로직
  useEffect(() => {
    if (map && selectedPlaceId) {
      const selected = places.find(p => p.id === selectedPlaceId);
      if (selected) {
        map.flyTo([selected.lat, selected.lng], 15, {
          animate: true,
          duration: 1.5,
        });
      }
    }
  }, [map, selectedPlaceId, places]);

  const defaultCenter: L.LatLngTuple = places.length > 0
    ? [places[0].lat, places[0].lng]
    : [36.2798, 126.9140]; // Default Buyeo Coordinates

  const polylinePositions = places.map((p) => [p.lat, p.lng] as L.LatLngTuple);

  return (
    <div className="w-full h-full relative z-0 rounded-3xl overflow-hidden">
      <MapContainer
        center={defaultCenter}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        ref={setMap}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="map-tiles transition-all duration-300"
        />
        
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={createPulseIcon()}
          >
            <Popup className="premium-popup">
              <div className="p-1 min-w-[140px]">
                <h3 className="font-bold text-gray-900 text-[14px] leading-tight mb-1">{place.name}</h3>
                <p className="text-gray-500 text-[11px] mb-2">{place.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-red uppercase">추천 머무는 시간</span>
                  <span className="text-[11px] font-bold text-gray-700">{place.duration}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 경로 그리기 */}
        {polylinePositions.length > 1 && (
          <Polyline 
            positions={polylinePositions} 
            pathOptions={{ color: "#ef4444", weight: 3, opacity: 0.6, dashArray: "6, 6" }} 
          />
        )}
      </MapContainer>
    </div>
  );
}
