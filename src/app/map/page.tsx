"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import {
  Music,
  Play,
  Shuffle,
  MapPin,
  Bookmark,
  Loader2,
  ChevronLeft,
  GripVertical,
  Edit3,
  MessageCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, Reorder, useDragControls } from 'framer-motion';
import { useRecommendationStore, RecommendedPlace } from "@/store/useRecommendationStore";
import { useChatStore } from "@/store/useChatStore";
import { normalizeTags } from "@/utils/tagGrouper";

// dynamically import leaflet component with ssr: false
const MapClient = dynamic(() => import('@/components/map/MapClient'), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full bg-gray-100 animate-pulse rounded-3xl flex items-center justify-center text-gray-400">지도 로딩 중...</div>
});

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function getCourseIdFromResponse(data: unknown): string | number | null {
  const root = asRecord(data);
  const nestedData = asRecord(root.data);
  const course = asRecord(nestedData.course || root.course);

  const courseId =
    course.course_id ??
    nestedData.course_id ??
    root.course_id ??
    course.id ??
    nestedData.id ??
    root.id;

  return typeof courseId === "string" || typeof courseId === "number" ? courseId : null;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

function toValidPlaceId(value: unknown): number | null {
  const numericId = Number(value);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

function createCoursePlacesPayload(places: Array<{ place_id?: unknown; memo?: string }>) {
  return places.map((place, index) => {
    const placeId = toValidPlaceId(place.place_id);
    if (!placeId) return null;

    return {
      place_id: placeId,
      visit_order: index + 1,
      memo: place.memo || null,
    };
  });
}

async function findSavedCourseIdByTitle(title: string, placeCount: number, token: string | null) {
  const apiUrl = `${getApiBaseUrl()}/api/courses`;
  const response = await fetch(apiUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => ({}));
  const root = asRecord(data);
  const nestedData = asRecord(root.data);
  const courses = nestedData.courses ?? root.courses ?? nestedData.items ?? root.items ?? [];
  if (!Array.isArray(courses)) return null;

  const matched = courses.find((course) => {
    const item = asRecord(course);
    const itemTitle = String(item.title || item.name || "");
    const itemPlaceCount = Number(item.place_count ?? item.places_count ?? item.count ?? 0);
    return itemTitle === title && (!itemPlaceCount || itemPlaceCount === placeCount);
  });

  if (!matched) return null;
  const matchedRecord = asRecord(matched);
  return matchedRecord.course_id ?? matchedRecord.id ?? null;
}

// CourseItem Component to handle drag controls and memo edit
function CourseItem({
  place,
  index,
  selectedPlaceId,
  setSelectedPlaceId,
  saveMemoToState
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const controls = useDragControls();
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [memo, setMemo] = useState(place.memo || "");

  const handleSaveMemo = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsEditingMemo(false);
    saveMemoToState(place.id, memo);
  };

  return (
    <Reorder.Item
      value={place}
      id={String(place.id)}
      dragListener={false}
      dragControls={controls}
      className={`relative rounded-3xl transition-all mb-3 overflow-hidden ${selectedPlaceId === place.id
        ? "bg-brand-red/5 dark:bg-brand-red/10 ring-1 ring-brand-red/20"
        : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
        }`}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={(e) => {
          // Prevent selecting when clicking input/buttons
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          setSelectedPlaceId(place.id);
        }}
      >
        <div className="relative flex-shrink-0 mt-1">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-lg font-black text-gray-400 dark:text-gray-600">
            {index + 1}
          </div>
          {selectedPlaceId === place.id && (
            <motion.div
              layoutId="active-indicator"
              className="absolute -left-1.5 top-1/4 w-1 h-1/2 bg-brand-red rounded-full"
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-2">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">{place.name}</h4>
              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">{place.desc}</p>
            </div>
            <span className="text-[10px] font-black text-brand-red bg-brand-red/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {place.duration}
            </span>
          </div>

          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {normalizeTags(place.tags).map((tag: string, idx: number) => (
                <span key={idx} className="inline-flex items-center rounded-full bg-brand-red/10 text-brand-red px-2 py-0.5 text-[10px] font-bold">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Memo Section */}
          <div className="mt-3">
            {isEditingMemo ? (
              <form onSubmit={handleSaveMemo} className="flex items-center gap-2">
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 남겨보세요"
                  className="flex-1 text-[12px] bg-gray-50 dark:bg-gray-800 border-none rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-brand-red text-gray-900 dark:text-white"
                  autoFocus
                  onBlur={() => handleSaveMemo()}
                />
              </form>
            ) : (
              <div className="flex items-start gap-2 group/memo min-h-[24px]">
                {place.memo ? (
                  <p
                    className="text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-snug flex-1 cursor-text"
                    onClick={() => setIsEditingMemo(true)}
                  >
                    {place.memo}
                  </p>
                ) : (
                  <p
                    className="text-[12px] text-gray-300 dark:text-gray-600 font-medium flex-1 cursor-text flex items-center gap-1 transition-colors hover:text-brand-red/70"
                    onClick={() => setIsEditingMemo(true)}
                  >
                    <Edit3 size={12} /> 메모 추가
                  </p>
                )}
                {place.memo && (
                  <button
                    onClick={() => setIsEditingMemo(true)}
                    className="text-gray-300/80 dark:text-gray-600 hover:text-brand-red dark:hover:text-brand-red transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drag Handle */}
        <div
          className="flex flex-col items-center justify-center pt-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors ml-1"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical size={20} />
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function CourseMap() {
  const router = useRouter();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "warning" | "error"; message: string } | null>(null);

  const {
    recommendedItineraryId,
    currentCourseName,
    savedCourseId,
    isBookmarked,
    setIsBookmarked,
    setSavedCourseId,
  } = useChatStore();
  const recommendations = useRecommendationStore((state) => state.recommendations);
  const setRecommendations = useRecommendationStore((state) => state.setRecommendations);
  const tripTitle = useRecommendationStore((state) => state.tripTitle);
  const hasCourse = recommendations.length > 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [places, setPlaces] = useState<any[]>([]);
  const [dbTagsMap, setDbTagsMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/places/filter`)
      .then(res => res.json())
      .then(data => {
        if (data?.status === "success" && data.data?.places) {
          const tagsMap: Record<string, string[]> = {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.data.places.forEach((p: any) => {
            if (p.name && p.tags) {
              tagsMap[p.name.trim()] = normalizeTags(p.tags);
            }
          });
          setDbTagsMap(tagsMap);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      setPlaces(recommendations.map((p, idx) => {
        const cleanName = p.name ? p.name.trim() : "";
        let dbTags = dbTagsMap[cleanName];
        if (!dbTags) {
          const matchedKey = Object.keys(dbTagsMap).find(k => k.includes(cleanName) || cleanName.includes(k));
          if (matchedKey) dbTags = dbTagsMap[matchedKey];
        }

        let finalTags = dbTags && dbTags.length > 0 ? dbTags : (p.tags || []);
        finalTags = normalizeTags(finalTags).filter((t: string) => !t.replace(/\s+/g, '').toLowerCase().includes('ai추천장소'));

        return {
          id: p.name + p.lat + idx, // Unique string id for Reorder
          place_id: p.place_id,
          name: p.name,
          desc: p.desc || p.type || "AI 추천 장소",
          duration: p.duration || "예정",
          lat: p.lat,
          lng: p.lng,
          tags: finalTags,
          memo: p.memo || ""
        };
      }));
    } else {
      setPlaces([]);
    }
  }, [recommendations, dbTagsMap]); // Re-sync if store or dbTagsMap changes externally

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveToStore = (currentPlaces: any[]) => {
    const newRecs: RecommendedPlace[] = currentPlaces.map((p, idx) => ({
      order: idx + 1,
      place_id: p.place_id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      type: p.desc,
      desc: p.desc,
      duration: p.duration,
      tags: p.tags,
      memo: p.memo
    }));
    setRecommendations(newRecs, tripTitle);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleReorder = (newOrder: any[]) => {
    setPlaces(newOrder);
    saveToStore(newOrder);
  };

  const saveMemoToState = (placeId: string | number, newMemo: string) => {
    const newPlaces = places.map(p =>
      p.id === placeId ? { ...p, memo: newMemo } : p
    );
    setPlaces(newPlaces);
    saveToStore(newPlaces);
  };

  const handleShuffle = () => {
    if (places.length <= 1) return;
    const shuffled = [...places];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPlaces(shuffled);
    saveToStore(shuffled);
  };

  const handleSaveCourse = async () => {
    if (!hasCourse || places.length === 0) {
      setToast({ type: "warning", message: "AI 플레이리스터에서 코스를 먼저 만들어주세요." });
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem("triply_token");
    const title = currentCourseName || tripTitle || "AI 추천 코스";

    try {
      if (isBookmarked) {
        const courseIdToDelete =
          savedCourseId ||
          await findSavedCourseIdByTitle(title, places.length, token);

        if (!courseIdToDelete) {
          setToast({ type: "warning", message: "저장된 코스를 찾지 못했어요." });
          return;
        }

        const deleteUrl = `${getApiBaseUrl()}/api/courses/${courseIdToDelete}`;
        const response = await fetch(deleteUrl, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.message || "코스 저장 취소에 실패했습니다.");
        }

        setSavedCourseId(null);
        setIsBookmarked(false);
        setToast({ type: "success", message: "코스 저장취소!" });
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      let courseIdAfterSave: string | number | null = recommendedItineraryId;
      let response: Response | null = null;
      let result: unknown = {};

      if (recommendedItineraryId) {
        const apiUrl = `${getApiBaseUrl()}/api/courses/from-itinerary/${recommendedItineraryId}`;

        response = await fetch(apiUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title,
            total_duration: null
          }),
        });

        result = await response.json().catch(() => ({}));
      }

      if (!response?.ok) {
        const coursePlaces = createCoursePlacesPayload(places);
        const hasMissingPlaceId = coursePlaces.some((place) => place === null);

        if (hasMissingPlaceId) {
          const resultRecord = asRecord(result);
          throw new Error(String(resultRecord.message || "저장할 장소 ID를 찾지 못했습니다."));
        }

        response = await fetch(`${getApiBaseUrl()}/api/courses`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title,
            total_duration: null,
            itinerary: coursePlaces,
          }),
        });

        result = await response.json().catch(() => ({}));
      }

      if (!response.ok) {
        const resultRecord = asRecord(result);
        throw new Error(String(resultRecord.message || "코스 저장에 실패했습니다."));
      }

      courseIdAfterSave =
        getCourseIdFromResponse(result) ??
        courseIdAfterSave;

      setToast({ type: "success", message: "코스 저장완료!" });
      if (courseIdAfterSave) {
        setSavedCourseId(String(courseIdAfterSave));
      }
      setIsBookmarked(true);
    } catch (error) {
      console.error("코스 저장 에러:", error);
      const message = error instanceof Error && error.message
        ? error.message
        : isBookmarked ? "저장 취소에 실패했어요." : "코스 저장에 실패했어요.";
      setToast({ type: "warning", message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20 transition-colors duration-300">
      <header className="p-5 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-full shadow-sm">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">MY PLAYLIST</h1>
        <button
          onClick={handleSaveCourse}
          disabled={isSaving}
          className="w-10 h-10 flex items-center justify-center text-gray-900 dark:text-white bg-white dark:bg-gray-900 rounded-full shadow-sm disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
        >
          {isSaving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} className={isBookmarked ? "text-gray-900 dark:text-white" : ""} />
          )}
        </button>
      </header>

      <main className="flex-1 px-5">
        <div className="sticky top-0 z-20 pt-2 pb-6 bg-[#F8F9FA] dark:bg-gray-950 -mx-5 px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[2.5rem] overflow-hidden shadow-xl shadow-brand-red/10 border border-white dark:border-gray-800"
          >
            <MapClient itinerary={places} selectedPlaceId={selectedPlaceId} resetTrigger={resetTrigger} />
          </motion.div>
        </div>

        <section className="mb-6 relative group">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
              {hasCourse ? (currentCourseName || tripTitle) : "아직 생성된 코스가 없어요"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-1 text-brand-red">
                <Music size={14} fill="currentColor" />
                <span>AI Recommended</span>
              </div>
              <span>•</span>
              <span>{places.length} spots</span>
              <span>•</span>
              <span>{places.some(p => p.duration !== "예정") ? "계획됨" : "시간 미정"}</span>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          {hasCourse ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Track List</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleShuffle}
                    className="text-gray-400 hover:text-brand-red transition-colors active:scale-95"
                    title="코스 순서 셔플"
                  >
                    <Shuffle size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPlaceId(null);
                      setResetTrigger(prev => prev + 1);
                    }}
                    className="w-8 h-8 bg-brand-red text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-red/30"
                    title="전체 코스 보기"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </div>

              <Reorder.Group
                axis="y"
                values={places}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {places.map((place, index) => (
                  <CourseItem
                    key={place.id}
                    place={place}
                    index={index}
                    selectedPlaceId={selectedPlaceId}
                    setSelectedPlaceId={setSelectedPlaceId}
                    saveMemoToState={saveMemoToState}
                  />
                ))}
              </Reorder.Group>
            </>
          ) : (
            <div className="rounded-[24px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-5 py-8 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
                <MessageCircle size={22} />
              </div>
              <h3 className="text-[16px] font-black text-gray-900 dark:text-white mb-1">
                AI 플레이리스터와 함께 코스를 생성해보세요!
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                원하는 분위기나 지역을 말하면 나만의 여행 코스를 만들어드릴게요.
              </p>
              <button
                onClick={() => router.push("/chat")}
                className="inline-flex items-center justify-center rounded-full bg-brand-red px-5 py-3 text-[14px] font-bold text-white shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
              >
                AI 플레이리스터 시작하기
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Floating Action Menu */}
      {hasCourse && (
      <div className="fixed bottom-24 right-6 flex flex-col gap-3">
        <button className="w-14 h-14 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full shadow-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center active:scale-95 transition-transform">
          <MapPin size={24} />
        </button>
      </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            className="fixed left-1/2 bottom-24 z-50 w-[calc(100%-40px)] max-w-[360px] -translate-x-1/2"
          >
            <div className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md border ${
              toast.type === "success"
                ? "bg-gray-900/95 text-white border-gray-800 dark:bg-white/95 dark:text-gray-900 dark:border-white"
                : toast.type === "warning"
                  ? "bg-white/95 text-gray-900 border-brand-red/20 dark:bg-gray-900/95 dark:text-white dark:border-brand-red/30"
                  : "bg-brand-red text-white border-brand-red"
            }`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                toast.type === "success"
                  ? "bg-brand-red text-white"
                  : toast.type === "warning"
                    ? "bg-brand-red/10 text-brand-red"
                    : "bg-white/20 text-white"
              }`}>
                {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              </div>
              <p className="text-[14px] font-black leading-tight">{toast.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
