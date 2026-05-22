"use client";

import { useState, useEffect } from "react";
import { Settings, Edit2, ChevronRight, CheckCircle2, Plus, FileText, HelpCircle, LogOut, Bell, ChevronLeft, MapPin, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useSavedStore } from "@/store/useSavedStore";

export default function MyPage() {
  const [view, setView] = useState<'main' | 'settings'>('main');
  const [userName, setUserName] = useState("어드벤처유한");
  const [userTitle, setUserTitle] = useState("강릉 감성 여행자");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [playlists, setPlaylists] = useState<any[]>([]);

  const { theme, setTheme } = useTheme();

  const savedItems = useSavedStore((state) => state.savedItems);
  const savedPlaces = savedItems.filter((i) => i.type === 'place');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("triply_token");
        if (!token) return;

        // Fetch User Info
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.data.name);
          if (userData.data.preferences?.travel_tags) {
            setTags(userData.data.preferences.travel_tags);
          }
        }

        // Fetch Saved Courses
        const courseRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setPlaylists(courseData.data.courses);
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ travel_tags: tags })
      });

      if (res.ok) {
        setIsEditingTags(false);
      }
    } catch (err) {
      console.error("Failed to update tags:", err);
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  if (view === 'settings') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-gray-950 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-10">
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
      <div className="flex items-center justify-between px-5 pt-4 pb-4 sticky top-0 z-10 bg-[#F8F9FA] dark:bg-gray-950">
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
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-2">{userTitle}</p>
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
              <span className="text-[20px] font-bold text-gray-900 dark:text-white leading-tight">{playlists.length}</span>
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
            {isEditingTags ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newTagInput} 
                  onChange={(e) => setNewTagInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-[13px] outline-none w-28 text-gray-900 dark:text-white"
                  placeholder="태그 입력"
                />
                <button onClick={handleAddTag} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#FF4B4B] bg-[#FF4B4B] text-white transition-colors">
                  <span className="text-[13px] font-medium">추가</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsEditingTags(true)} className="flex items-center gap-1 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Plus size={14} />
                <span className="text-[13px] font-medium">추가</span>
              </button>
            )}
          </div>
        </div>

        {/* Saved Playlists */}
        <div className="bg-white dark:bg-gray-900 rounded-[24px] p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[16px] font-bold text-gray-900 dark:text-white">저장한 플리</h3>
            <button className="text-[13px] font-medium text-[#FF4B4B] flex items-center">
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
            {playlists.length > 0 ? playlists.map(pl => (
              <div key={pl.course_id} className="min-w-[140px] w-[140px] flex flex-col shrink-0">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100 border border-gray-100 dark:border-gray-800">
                  {pl.thumbnail_url ? (
                    <img src={pl.thumbnail_url} className="w-full h-full object-cover" alt={pl.title} />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">이미지 없음</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mb-0.5">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#FF4B4B]">
                    <path d="M8 6h13" />
                    <path d="M8 12h13" />
                    <path d="M8 18h13" />
                    <path d="M3 6h.01" />
                    <path d="M3 12h.01" />
                    <path d="M3 18h.01" />
                  </svg>
                  <h4 className="font-bold text-[13px] text-gray-900 dark:text-white truncate">{pl.title}</h4>
                </div>
                <p className="text-[11px] text-gray-400">{pl.place_count}곳 · {pl.total_duration ? `${pl.total_duration}분` : '시간 미정'}</p>
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
            <button className="text-[13px] font-medium text-[#FF4B4B] flex items-center">
              전체보기 <ChevronRight size={14} />
            </button>
          </div>

          {savedPlaces.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2">
              {savedPlaces.map(place => (
                <div key={place.id} className="min-w-[140px] w-[140px] flex flex-col shrink-0">
                  <div className="w-full aspect-square rounded-2xl overflow-hidden mb-2 bg-gray-100 border border-gray-100 dark:border-gray-800 relative">
                    <img src={place.image_url} className="absolute inset-0 w-full h-full object-cover" alt={place.name} />
                  </div>
                  <h4 className="font-bold text-[13px] text-gray-900 dark:text-white truncate">{place.name}</h4>
                  {place.location && (
                    <p className="text-[11px] text-gray-400 truncate flex items-center gap-0.5 mt-0.5">
                      <MapPin size={10} className="text-[#FF4B4B]" /> {place.location}
                    </p>
                  )}
                </div>
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
