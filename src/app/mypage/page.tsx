"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Settings, Edit2, ChevronRight, CheckCircle2, Plus, FileText, HelpCircle, LogOut, Bell, ChevronLeft, MapPin, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useSavedStore } from "@/store/useSavedStore";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "next/navigation";
import { normalizeTags } from "@/utils/tagGrouper";
import Link from "next/link";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(path: string) {
  if (!API_BASE_URL) return null;
  return `${API_BASE_URL}${path}`;
}

function getAssetUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const AVAILABLE_TAGS = [
  "자연친화", "휴식", "가족여행", "혼자", "익스트림", "커플",
  "맛집탐방", "도심야경", "사진명소", "가성비", "럭셔리", "역사/문화"
];

function formatDuration(minutes: number | null | undefined) {
  if (minutes === null || minutes === undefined) return '시간 미정';
  if (minutes === 0) return '0분';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}시간 ${m}분`;
  if (h > 0) return `${h}시간`;
  return `${m}분`;
}

const CourseCollage = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <span className="text-gray-400 text-xs">이미지 없음</span>
      </div>
    );
  }
  
  const urls = images.map(getAssetUrl);

  if (urls.length === 1) {
    return <img src={urls[0]} className="w-full h-full object-cover" alt="course" />;
  }
  if (urls.length === 2) {
    return (
      <div className="flex w-full h-full gap-0.5 bg-white dark:bg-gray-900">
        <img src={urls[0]} className="w-1/2 h-full object-cover" alt="course 1" />
        <img src={urls[1]} className="w-1/2 h-full object-cover" alt="course 2" />
      </div>
    );
  }
  return (
    <div className="flex w-full h-full gap-0.5 bg-white dark:bg-gray-900">
      <div className="w-[60%] h-full">
        <img src={urls[0]} className="w-full h-full object-cover" alt="course 1" />
      </div>
      <div className="w-[40%] h-full flex flex-col gap-0.5">
        <img src={urls[1]} className="w-full h-[calc(50%-1px)] object-cover" alt="course 2" />
        <img src={urls[2]} className="w-full h-[calc(50%-1px)] object-cover" alt="course 3" />
      </div>
    </div>
  );
};

export default function MyPage() {
  const [view, setView] = useState<'main' | 'settings' | 'savedPlaces' | 'savedPlaylists' | 'playlistDetail'>('main');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const router = useRouter();
  const [deletingPlaylistId, setDeletingPlaylistId] = useState<number | null>(null);
  const [userName, setUserName] = useState("로딩중...");
  const [userId, setUserId] = useState("loading...");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [playlists, setPlaylists] = useState<any[]>([]);

  const { theme, setTheme } = useTheme();

  const isMounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const savedItems = useSavedStore((state) => state.savedItems);
  const toggleItem = useSavedStore((state) => state.toggleItem);
  const deletedPlaylistIds = useSavedStore((state) => state.deletedPlaylistIds || []);
  const deletePlaylist = useSavedStore((state) => state.deletePlaylist);
  const savedPlaces = isMounted && Array.isArray(savedItems)
    ? savedItems.filter((i) => i?.type === 'place')
    : [];
  
  const visiblePlaylists = isMounted && Array.isArray(deletedPlaylistIds)
    ? playlists.filter((pl) => !deletedPlaylistIds.includes(pl.course_id))
    : playlists;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("triply_token");
        if (!token) return;
        const userUrl = getApiUrl("/api/users/me");
        const coursesUrl = getApiUrl("/api/courses");
        if (!userUrl || !coursesUrl) return;

        // Fetch User Info
        const userRes = await fetch(userUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data?.name) {
            setUserName(userData.data.name);
          }
          if (userData.data?.user_id) {
            setUserId(userData.data.user_id);
          }
          if (userData.data?.preferences?.travel_tags) {
            setTags(normalizeTags(userData.data.preferences.travel_tags));
          }
        }

        // Fetch Saved Courses
        const courseRes = await fetch(coursesUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          const courses = Array.isArray(courseData.data?.courses) ? courseData.data.courses : [];
          
          // N+1 Fetch to get multiple images
          const coursesWithDetails = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            courses.map(async (c: any) => {
              try {
                const detailRes = await fetch(getApiUrl(`/api/courses/${c.course_id}`) || '', {
                  headers: { Authorization: `Bearer ${token}` }
                });
                if (detailRes.ok) {
                  const detailData = await detailRes.json();
                  const places = detailData.data?.course?.places || [];
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const images = places.map((p: any) => p.image_url).filter(Boolean);
                  return { ...c, images, places };
                }
              } catch {
                // Ignore error
              }
              // fallback to thumbnail_url if details fail
              return { ...c, images: c.thumbnail_url ? [c.thumbnail_url] : [] };
            })
          );
          setPlaylists(coursesWithDetails);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    };
    fetchUserData();
  }, []);

  const handleSaveTags = async () => {
    try {
      const token = localStorage.getItem("triply_token");
      if (!token) return;
      const preferencesUrl = getApiUrl("/api/users/preferences");
      if (!preferencesUrl) return;

      const res = await fetch(preferencesUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ travel_tags: { flat_tags: tags } })
      });

      if (res.ok) {
        setIsEditingTags(false);
      }
    } catch (err) {
      console.error("Failed to update tags:", err);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    if (!tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (view === 'savedPlaces') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20">
        <div className="flex items-center justify-between px-5 pt-4 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-30">
          <button onClick={() => setView('main')} className="p-1 -ml-1 text-gray-900 dark:text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
            찜한 장소 전체보기
          </h1>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10">
          <div className="grid grid-cols-2 gap-4">
            {savedPlaces.map(place => (
              <Link href={`/place/${place.id.replace(/^(place-|festival-)/, '')}`} key={place.id} className="flex flex-col relative group">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100 border border-gray-100 dark:border-gray-800 relative shadow-sm">
                  {place.image_url ? (
                    <img src={getAssetUrl(place.image_url)} className="absolute inset-0 w-full h-full object-cover" alt={place.name} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                      <span className="text-[11px] text-gray-400">이미지 없음</span>
                    </div>
                  )}
                  {/* Immediate Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleItem(place);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#FF4B4B]/90 transition-colors z-10 active:scale-95 shadow-md"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
                <h4 className="font-bold text-[13px] text-gray-900 dark:text-white truncate">{place.name}</h4>
                {place.location && (
                  <p className="text-[11px] text-gray-400 truncate flex items-center gap-0.5 mt-0.5">
                    <MapPin size={10} className="text-[#FF4B4B]" /> {place.location}
                  </p>
                )}
              </Link>
            ))}
          </div>
          {savedPlaces.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[14px] text-gray-400">찜한 장소가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'playlistDetail' && selectedPlaylist) {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-[100px]">
        <div className="flex items-center justify-between px-5 pt-4 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-30">
          <button onClick={() => setView('main')} className="p-1 -ml-1 text-gray-900 dark:text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2 w-[60%] text-center truncate">
            {selectedPlaylist.title}
          </h1>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10">
          <div className="grid grid-cols-2 gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {selectedPlaylist.places?.map((place: any) => (
              <Link href={`/place/${place.place_id}`} key={place.place_id} className="flex flex-col relative group">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100 border border-gray-100 dark:border-gray-800 relative shadow-sm">
                  {place.image_url ? (
                    <img src={getAssetUrl(place.image_url)} className="absolute inset-0 w-full h-full object-cover" alt={place.name} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                      <span className="text-[11px] text-gray-400">이미지 없음</span>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-[13px] text-gray-900 dark:text-white truncate">{place.name}</h4>
                {place.location && (
                  <p className="text-[11px] text-gray-400 truncate flex items-center gap-0.5 mt-0.5">
                    <MapPin size={10} className="text-[#FF4B4B]" /> {place.location}
                  </p>
                )}
              </Link>
            ))}
          </div>
          {(!selectedPlaylist.places || selectedPlaylist.places.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[14px] text-gray-400">플리에 포함된 장소가 없습니다.</p>
            </div>
          )}
        </div>
        
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-[440px] px-5">
          <button 
            onClick={() => {
              if (!selectedPlaylist.places || selectedPlaylist.places.length === 0) return;
              const chatStore = useChatStore.getState();
              chatStore.setCurrentItinerary(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                selectedPlaylist.places.map((p: any) => ({
                  id: String(p.place_id),
                  name: p.name,
                  location: p.location,
                  latitude: p.latitude,
                  longitude: p.longitude,
                  image_url: p.image_url,
                  category: p.category,
                  description: p.description,
                  tags: p.tags,
                  festival_score: p.festival_score,
                  trend_score: p.trend_score,
                  visit_order: p.visit_order,
                  memo: p.memo,
                }))
              );
              chatStore.setCurrentCourseName(selectedPlaylist.title);
              chatStore.setTotalDistance(selectedPlaylist.total_distance_km || selectedPlaylist.total_distance || null);
              router.push('/map');
            }}
            className="w-full bg-[#FF4B4B] hover:bg-red-500 text-white font-bold py-4 rounded-full shadow-lg shadow-[#FF4B4B]/30 transition-all flex justify-center items-center h-[56px] text-[16px]"
          >
            지도 코스로 보기
          </button>
        </div>
      </div>
    );
  }

  if (view === 'savedPlaylists') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20">
        <div className="flex items-center justify-between px-5 pt-4 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-30">
          <button onClick={() => setView('main')} className="p-1 -ml-1 text-gray-900 dark:text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
            저장한 플리 전체보기
          </h1>
          <div className="w-6" />
        </div>
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10">
          <div className="grid grid-cols-2 gap-4">
            {visiblePlaylists.map(pl => (
              <div 
                key={pl.course_id} 
                onClick={() => {
                  setSelectedPlaylist(pl);
                  setView('playlistDetail');
                }}
                className="flex flex-col relative group bg-white dark:bg-gray-900 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-50 dark:border-gray-800 pb-3 cursor-pointer"
              >
                <div className="w-full h-[120px] bg-gray-100 dark:bg-gray-800 relative">
                  <CourseCollage images={pl.images || (pl.thumbnail_url ? [pl.thumbnail_url] : [])} />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingPlaylistId(pl.course_id);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#FF4B4B]/90 transition-colors z-10 active:scale-95 shadow-md"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
                <div className="px-3 pt-3">
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#FF4B4B] shrink-0 mt-[3px]">
                      <path d="M8 6h13" />
                      <path d="M8 12h13" />
                      <path d="M8 18h13" />
                      <path d="M3 6h.01" />
                      <path d="M3 12h.01" />
                      <path d="M3 18h.01" />
                    </svg>
                    <h4 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight line-clamp-2">{pl.title}</h4>
                  </div>
                  <p className="text-[12px] text-gray-400 pl-[20px]">{pl.place_count}곳 · {formatDuration(pl.total_duration)}</p>
                </div>
              </div>
            ))}
          </div>
          {visiblePlaylists.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[14px] text-gray-400">저장한 플리가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deletingPlaylistId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-[320px] shadow-xl border border-gray-100 dark:border-gray-800">
              <h3 className="text-[18px] font-bold text-gray-900 dark:text-white mb-2 text-center">삭제하시겠습니까?</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-6 text-center">선택한 플레이리스트가 목록에서 영구적으로 삭제됩니다.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeletingPlaylistId(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-[15px] active:scale-95 transition-all"
                >
                  취소
                </button>
                <button 
                  onClick={() => {
                    deletePlaylist(deletingPlaylistId!);
                    setDeletingPlaylistId(null);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-[#FF4B4B] hover:bg-red-600 text-white font-bold text-[15px] active:scale-95 transition-all shadow-md shadow-red-500/20"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-30">
          <button onClick={() => setView('main')} className="p-1 -ml-1 text-gray-900 dark:text-white">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-[17px] font-bold text-gray-900 dark:text-white absolute left-1/2 -translate-x-1/2">
            설정
          </h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4">
          {/* 계정 Section */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-gray-400 mb-2 pl-2">계정</h2>
            <div className="bg-white dark:bg-gray-900 rounded-[20px] overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">프로필 편집</span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">계정 정보</span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
              <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 dark:active:bg-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">비밀번호 변경</span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            </div>
          </div>

          {/* 알림 Section */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-gray-400 mb-2 pl-2">알림</h2>
            <div className="bg-white dark:bg-gray-900 rounded-[20px] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">푸시 알림</span>
                <div className="w-11 h-6 bg-[#FF4B4B] rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">이메일 알림</span>
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full relative cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* 기타 Section */}
          <div className="mb-8">
            <h2 className="text-[13px] font-bold text-gray-400 mb-2 pl-2">기타</h2>
            <div className="bg-white dark:bg-gray-900 rounded-[20px] overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">언어 설정</span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">테마 설정</span>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-400">{theme === 'dark' ? '다크' : '라이트'}</span>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">캐시 삭제</span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
              <div className="w-full flex items-center justify-between p-4">
                <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">앱 버전</span>
                <span className="text-[14px] text-gray-400">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-4 sticky top-0 z-30 bg-[#F8F9FA] dark:bg-gray-950">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">마이페이지</h1>
        <button onClick={() => setView('settings')} className="text-gray-800 dark:text-white">
          <Settings size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-5 mb-6">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#FF4B4B] flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-white leading-none mb-1">
                {userName.charAt(0)}
              </span>
            </div>
            
            {/* Info */}
            <div className="flex flex-col flex-1">
              <h2 className="text-[18px] font-bold text-gray-900 dark:text-white mb-1">{userName}</h2>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-2">@{userId}</p>
              <button className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 w-fit hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Edit2 size={12} className="text-gray-400" />
                <span className="text-[12px] font-medium text-gray-600 dark:text-gray-300">수정</span>
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gray-100 dark:bg-gray-800 mb-5" />

          {/* Stats */}
          <div className="flex justify-between items-center px-2">
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight">{visiblePlaylists.length}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">저장한 플리</span>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight">{savedPlaces.length}</span>
              <span className="text-[11px] text-gray-400 mt-0.5">찜한 장소</span>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col items-center">
              <span className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight">0</span>
              <span className="text-[11px] text-gray-400 mt-0.5">다녀온 코스</span>
            </div>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">내 여행 취향</h3>
            {isEditingTags ? (
              <button onClick={handleSaveTags} className="text-[13px] font-medium text-[#FF4B4B]">완료</button>
            ) : (
              <button onClick={() => setIsEditingTags(true)} className="text-[13px] font-medium text-[#FF4B4B]">수정</button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <div key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#FF4B4B] bg-white dark:bg-gray-900 text-[#FF4B4B]">
                <CheckCircle2 size={14} className="fill-[#FF4B4B] text-white" />
                <span className="text-[13px] font-medium">{tag}</span>
                {isEditingTags && (
                  <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-[#FF4B4B] hover:text-red-700 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {!isEditingTags && (
              <button onClick={() => setIsEditingTags(true)} className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Plus size={14} />
                <span className="text-[13px] font-medium">추가</span>
              </button>
            )}
          </div>

          {/* Show available tags when editing */}
          {isEditingTags && (
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[13px] font-bold text-gray-500 mb-3">추가할 수 있는 취향 태그</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.filter(t => !tags.includes(t)).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-[#FF4B4B] hover:text-[#FF4B4B] transition-colors"
                  >
                    <Plus size={12} />
                    <span className="text-[13px] font-medium">{tag}</span>
                  </button>
                ))}
                {AVAILABLE_TAGS.filter(t => !tags.includes(t)).length === 0 && (
                  <span className="text-[13px] text-gray-400">모든 취향 태그를 선택하셨습니다.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Saved Playlists */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">저장한 플리</h3>
            <button onClick={() => setView('savedPlaylists')} className="text-[13px] font-medium text-[#FF4B4B] flex items-center hover:underline">
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-4">
            {visiblePlaylists.length > 0 ? visiblePlaylists.map(pl => (
              <div 
                key={pl.course_id} 
                onClick={() => {
                  setSelectedPlaylist(pl);
                  setView('playlistDetail');
                }}
                className="min-w-[160px] w-[160px] flex flex-col shrink-0 bg-white dark:bg-gray-800 rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-gray-50 dark:border-gray-700 cursor-pointer"
              >
                <div className="w-full h-[100px] bg-gray-100 dark:bg-gray-700">
                  <CourseCollage images={pl.images || (pl.thumbnail_url ? [pl.thumbnail_url] : [])} />
                </div>
                <div className="p-3">
                  <div className="flex items-start gap-1.5 mb-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#FF4B4B] shrink-0 mt-[3px]">
                      <path d="M8 6h13" />
                      <path d="M8 12h13" />
                      <path d="M8 18h13" />
                      <path d="M3 6h.01" />
                      <path d="M3 12h.01" />
                      <path d="M3 18h.01" />
                    </svg>
                    <h4 className="font-bold text-[14px] text-gray-900 dark:text-white leading-tight line-clamp-2">{pl.title}</h4>
                  </div>
                  <p className="text-[12px] text-gray-400 pl-[20px]">{pl.place_count}곳 · {formatDuration(pl.total_duration)}</p>
                </div>
              </div>
            )) : (
              <div className="w-full text-center py-6">
                <p className="text-[13px] text-gray-400">저장한 플리가 없습니다.</p>
              </div>
            )}
          </div>
        </div>

        {/* Saved Places */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">찜한 장소</h3>
            <button onClick={() => setView('savedPlaces')} className="text-[13px] font-medium text-[#FF4B4B] flex items-center hover:underline">
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          {savedPlaces.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
              {savedPlaces.map(place => (
                <Link href={`/place/${place.id.replace(/^(place-|festival-)/, '')}`} key={place.id} className="min-w-[140px] w-[140px] flex flex-col shrink-0">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100 border border-gray-100 dark:border-gray-800 relative">
                    {place.image_url ? (
                      <img src={getAssetUrl(place.image_url)} className="absolute inset-0 w-full h-full object-cover" alt={place.name} />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                        <span className="text-[11px] text-gray-400">이미지 없음</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-[13px] text-gray-900 dark:text-white truncate">{place.name}</h4>
                  {place.location && (
                    <p className="text-[11px] text-gray-400 truncate flex items-center gap-0.5 mt-0.5">
                      <MapPin size={10} className="text-[#FF4B4B]" /> {place.location}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[13px] text-gray-400">아직 찜한 장소가 없어요.</p>
            </div>
          )}
        </div>

        {/* Menus */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4">
          <button onClick={() => setView('settings')} className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <Settings size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-[15px] font-medium text-gray-900 dark:text-white">앱 설정</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
          
          <button className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-[15px] font-medium text-gray-900 dark:text-white">알림 설정</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-[15px] font-medium text-gray-900 dark:text-white">이용약관</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button className="w-full flex items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-gray-700 dark:text-gray-300" />
              <span className="text-[15px] font-medium text-gray-900 dark:text-white">고객센터</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button className="w-full flex items-center justify-between p-5 active:bg-red-50 dark:active:bg-red-950/20 transition-colors">
            <div className="flex items-center gap-3">
              <LogOut size={20} className="text-[#FF4B4B]" />
              <span className="text-[15px] font-medium text-[#FF4B4B]">로그아웃</span>
            </div>
            <ChevronRight size={18} className="text-red-200" />
          </button>
        </div>
      </div>
    </div>
  );
}
