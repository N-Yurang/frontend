"use client";

import { useState, useEffect } from "react";
import { User, Settings, CheckCircle2, Sparkles, Heart, Library, Monitor, Moon, Sun, ChevronRight, LogOut, Edit2 } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const TAGS = [
  "자연친화", "휴식", "가족여행", "혼자", "익스트림", "커플",
  "맛집탐방", "도심야경", "사진명소", "가성비", "럭셔리", "역사/문화"
];

export default function MyPage() {
  const [userName, setUserName] = useState("여행자");
  const [tags, setTags] = useState<string[]>(["자연친화", "사진명소", "맛집탐방"]);
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);

  const toggleTag = async (tag: string) => {
    let updatedTags: string[] = [];
    setTags((prev) => {
      const newTags = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      updatedTags = newTags;
      return newTags;
    });

    const token = localStorage.getItem("triply_token");
    if (!token) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          travel_tags: { flat_tags: updatedTags }
        })
      });
    } catch (e) {
      console.error("Failed to update tags to server", e);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("triply_token");
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setUserName(data.data.name || "여행자");
          
          if (data.data.preferences && data.data.preferences.travel_tags) {
            let tagsObj = data.data.preferences.travel_tags;
            
            // If the backend returns the JSON as a string, parse it first
            if (typeof tagsObj === 'string') {
              try {
                tagsObj = JSON.parse(tagsObj);
              } catch (e) {
                console.error("Failed to parse travel_tags string", e);
              }
            }

            const fetchedTags = tagsObj?.flat_tags;
            if (Array.isArray(fetchedTags)) {
              setTags(fetchedTags);
            } else {
              // Fallback just in case it's an array directly
              if (Array.isArray(tagsObj)) {
                setTags(tagsObj);
              } else {
                setTags([]);
              }
            }
          } else {
            setTags([]);
          }
        }
      } catch (e) {
        console.error("Failed to load user profile", e);
      }
    };

    loadProfile();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 pb-20 transition-colors duration-500">
      {/* Header */}
      <div className="pt-4 pb-4 px-5 bg-white dark:bg-gray-950 sticky top-0 z-10 border-b border-gray-50 dark:border-gray-900 flex items-center justify-between transition-colors">
        <div className="w-8" /> {/* Spacer */}
        <h1 className="text-[17px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest transition-colors">MY PROFILE</h1>
        <button onClick={() => setIsThemeOpen(true)} className="w-8 flex justify-end text-gray-400 hover:text-brand-red transition-colors">
          <Settings size={22} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-5">
        {/* Profile Section (Artist Info) */}
        <section className="pt-8 pb-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-5"
          >
            <div className="w-28 h-28 rounded-full border-4 border-brand-red/10 p-1 bg-gradient-to-tr from-brand-red to-teal-400 shadow-xl shadow-brand-red/10">
              <div className="w-full h-full bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 overflow-hidden">
                <User size={56} fill="currentColor" opacity={0.2} />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 bg-brand-red text-white p-1.5 rounded-full border-2 border-white dark:border-gray-950 shadow-lg">
              <Edit2 size={12} strokeWidth={3} />
            </div>
          </motion.div>

          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-1.5 transition-colors">
              {userName}
              <CheckCircle2 size={18} className="text-brand-red fill-current/10" />
            </h2>
            <p className="text-xs font-black text-gray-400 mt-1 uppercase tracking-widest">VERIFIED TRAVELER</p>
          </div>

          <div className="mt-6 flex gap-8">
            <div className="text-center">
              <span className="block text-lg font-black text-gray-900 dark:text-white leading-none transition-colors">12</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Saves</span>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <span className="block text-lg font-black text-gray-900 dark:text-white leading-none transition-colors">3</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Playlists</span>
            </div>
            <div className="w-px h-8 bg-gray-100 dark:bg-gray-800" />
            <div className="text-center">
              <span className="block text-lg font-black text-gray-900 dark:text-white leading-none transition-colors">28</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Spots</span>
            </div>
          </div>
        </section>

        {/* Travel Preferences (Tags) */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center text-sm font-black text-gray-900 dark:text-gray-100 gap-1.5 transition-colors uppercase tracking-widest">
              <Sparkles size={16} className="text-brand-red" />
              <span>Travel Tags</span>
            </h3>
            <button
              onClick={() => setIsTagsModalOpen(true)}
              className="text-[11px] font-black text-brand-red hover:underline"
            >
              EDIT
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <motion.span
                key={tag}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs px-4 py-2 rounded-xl font-bold transition-colors border border-transparent hover:border-brand-red/20"
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        </section>

        {/* My Playlists (Records) */}
        <section className="mb-12">
          <h3 className="flex items-center text-sm font-black text-gray-900 dark:text-gray-100 mb-5 gap-1.5 transition-colors uppercase tracking-widest">
            <Library size={16} className="text-teal-500" />
            <span>My Playlists</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-brand-red/80 to-red-600 rounded-3xl mb-3 flex items-center justify-center shadow-lg shadow-brand-red/20 group-hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
                <Heart size={42} fill="white" className="text-white drop-shadow-lg" />
              </div>
              <h4 className="font-bold text-[14px] text-gray-900 dark:text-gray-100 transition-colors px-1">찜한 여행지</h4>
              <p className="text-[11px] text-gray-400 font-medium px-1 mt-0.5">12 spots saved</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl mb-3 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-xl transition-all relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover:opacity-100" />
                <Library size={42} fill="white" className="text-white drop-shadow-lg" />
              </div>
              <h4 className="font-bold text-[14px] text-gray-900 dark:text-gray-100 transition-colors px-1">저장된 코스</h4>
              <p className="text-[11px] text-gray-400 font-medium px-1 mt-0.5">3 itineraries</p>
            </motion.div>
          </div>
        </section>

        {/* Menu Items */}
        <section className="space-y-1">
          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                <Monitor size={20} className="text-gray-500" />
              </div>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">System Preferences</span>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-colors group text-red-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors">
                <LogOut size={20} />
              </div>
              <span className="text-sm font-bold">Sign Out</span>
            </div>
            <ChevronRight size={18} className="text-red-200" />
          </button>
        </section>
      </div>

      {/* Theme Settings Modal */}
      <AnimatePresence>
        {isThemeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-5"
            onClick={() => setIsThemeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-[340px] rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red to-teal-400" />

              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2">
                <Monitor size={22} className="text-brand-red" />
                <span>Theme Settings</span>
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'light', label: 'Light Mode', icon: Sun },
                  { id: 'dark', label: 'Dark Mode', icon: Moon },
                  { id: 'system', label: 'System Default', icon: Monitor }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setTheme(item.id); setIsThemeOpen(false); }}
                    className={`flex items-center justify-between py-4 px-5 rounded-2xl font-bold transition-all
                      ${theme === item.id
                        ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {theme === item.id && <CheckCircle2 size={18} className="fill-white/20" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags Settings Modal */}
      <AnimatePresence>
        {isTagsModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-5"
            onClick={() => setIsTagsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-[380px] rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-brand-red" />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">Edit Tags</h2>
                <button onClick={() => setIsTagsModalOpen(false)} className="bg-brand-red text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest active:scale-95 transition-transform">DONE</button>
              </div>

              <div className="flex flex-wrap gap-2.5 max-h-[45vh] overflow-y-auto pb-4 pr-1 scrollbar-hide">
                {TAGS.map((tag) => {
                  const isSelected = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-black transition-all border-2
                        ${isSelected
                          ? "bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/10"
                          : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-brand-red/30"
                        }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
