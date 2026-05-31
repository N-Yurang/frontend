"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, Heart, ChevronLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { useSavedStore } from "@/store/useSavedStore";

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

async function fetchJson<T>(path: string): Promise<T | null> {
  const url = getApiUrl(path);
  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const router = useRouter();

  const [searchValue, setSearchValue] = useState(query);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const toggleItem = useSavedStore((state) => state.toggleItem);
  const savedItems = useSavedStore((state) => state.savedItems);
  const isSaved = (id: string) => savedItems.some((item) => item.id === id);
  const loadSavedItems = useSavedStore((state) => state.loadSavedItems);

  useEffect(() => {
    loadSavedItems();
  }, [loadSavedItems]);

  const performSearch = (q: string) => {
    if (!q.trim()) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchJson<any>(`/api/search?q=${encodeURIComponent(q)}`)
      .then((data) => {
        if (data?.data?.items && Array.isArray(data.data.items)) {
          setItems(data.data.items);
        } else if (data?.items && Array.isArray(data.items)) {
          setItems(data.items);
        } else if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    performSearch(query);
    setSearchValue(query);
  }, [query]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 transition-colors duration-300">
      {/* Header */}
      <header className="px-5 pt-3 pb-4 bg-white dark:bg-gray-950 sticky top-0 z-40 transition-colors duration-300 border-b border-gray-100 dark:border-gray-900 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-600 dark:text-gray-300 hover:text-brand-red transition-colors">
            <ChevronLeft size={28} />
          </button>
          <div className="relative flex-1 flex items-center h-12 bg-gray-100 dark:bg-gray-900 border border-transparent focus-within:border-brand-red/30 focus-within:bg-white dark:focus-within:bg-gray-950 rounded-2xl transition-all shadow-inner focus-within:shadow-md">
            <div className="absolute left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 focus-within:text-brand-red transition-colors" />
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="어디로 떠나볼까요?"
              className="w-full h-full pl-11 pr-4 bg-transparent border-transparent text-[15px] font-medium outline-none dark:text-white"
            />
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 px-5 pt-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="text-brand-red">'{query}'</span> 검색 결과
          </h2>
          <p className="text-sm text-gray-500 mt-1 font-medium">총 {items.length}개의 결과를 찾았습니다.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-32 w-full rounded-[24px] bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-5 border border-gray-200 dark:border-gray-800">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500 text-sm">다른 검색어로 다시 시도해보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => {
              const isPlace = item.type === "place";
              const itemId = item.id || item.place_id || item.festival_id || idx;
              const title = item.name || item.title;
              const imageUrl = item.image_url ? getAssetUrl(item.image_url) : getAssetUrl(item.image);
              const locationOrDate = item.location || item.date_text || item.date || "";

              const content = (
                <div className="flex p-3 bg-white dark:bg-gray-900 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-brand-red/30 transition-all group h-32">
                  <div className="relative h-full aspect-square rounded-[18px] overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                    {imageUrl ? (
                      <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="text-gray-300" size={28} />
                      </div>
                    )}
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleItem({
                          id: `${item.type}-${itemId}`,
                          type: isPlace ? 'place' : 'festival',
                          name: title,
                          location: item.location,
                          dateStr: item.date_text || item.date,
                          image_url: imageUrl
                        });
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all hover:bg-black/40 active:scale-95"
                    >
                      <Heart
                        size={16}
                        className={`${isSaved(`${item.type}-${itemId}`) ? "text-brand-red fill-brand-red" : "text-white"}`}
                      />
                    </button>
                  </div>

                  <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center py-1">
                    <div className="mb-1.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isPlace ? 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/50 dark:text-blue-400' : 'bg-brand-red/5 text-brand-red border border-brand-red/10'}`}>
                        {isPlace ? '장소' : '축제'}
                      </span>
                    </div>
                    <h3 className="font-bold text-[16px] text-gray-900 dark:text-white truncate mb-1.5 group-hover:text-brand-red transition-colors">{title}</h3>
                    <p className="text-[12px] text-gray-500 font-medium flex items-center gap-1.5 truncate">
                      {isPlace ? <MapPin size={14} className="text-gray-400" /> : <Calendar size={14} className="text-gray-400" />}
                      <span className="truncate">{locationOrDate}</span>
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-gray-400 mt-2 line-clamp-1 leading-tight overflow-hidden text-ellipsis">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              );

              const isFestival = item.type === "festival";
              const href = isPlace ? `/place/${itemId}` : (isFestival ? `/festival/${itemId}` : null);

              return href ? (
                <Link key={`search-${item.type}-${itemId}`} href={href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={`search-${item.type}-${itemId}`} className="block">
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="w-8 h-8 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
