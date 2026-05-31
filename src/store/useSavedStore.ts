import { create } from 'zustand';

export interface SavedItem {
  id: string;
  type: 'place' | 'festival';
  name: string;
  location?: string;
  dateStr?: string;
  image_url: string;
}

interface SavedState {
  savedItems: SavedItem[];
  isLoading: boolean;
  loadSavedItems: () => Promise<void>;
  toggleItem: (item: SavedItem) => Promise<void>;
  clearSavedItems: () => void;
  isSaved: (id: string) => boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const savedPlaceListEndpoints = [
  '/api/likes',
  '/api/saved-places',
  '/api/users/saved-places',
  '/api/places/saved',
  '/api/favorites/places',
];

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('triply_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getPlaceId(id: string) {
  return id.replace(/^place-/, '');
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function normalizeSavedItem(raw: unknown): SavedItem | null {
  const rawRecord = asRecord(raw);
  
  // 만약 백엔드에서 type과 id가 포함된 items 배열의 요소라면 그대로 사용
  if (rawRecord.type === 'festival' || rawRecord.type === 'place') {
    const formatDate = (dateStr: unknown) => {
      if (!dateStr || typeof dateStr !== 'string') return "";
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
    };

    let dateStr = undefined;
    if (rawRecord.type === 'festival') {
      dateStr = rawRecord.start_date
        ? (rawRecord.end_date ? `${formatDate(rawRecord.start_date)}~${formatDate(rawRecord.end_date)}` : formatDate(rawRecord.start_date))
        : String(rawRecord.date || '');
    }

    return {
      id: String(rawRecord.id),
      type: rawRecord.type as 'place' | 'festival',
      name: String(rawRecord.name || rawRecord.title || ''),
      location: String(rawRecord.location || rawRecord.address || ''),
      image_url: String(rawRecord.image_url || rawRecord.image || ''),
      dateStr: dateStr,
    };
  }

  // 레거시 응답 호환 (단일 place 객체)
  const place = asRecord(rawRecord.place || raw);
  const placeId = place.place_id ?? place.id ?? rawRecord.place_id;
  if (!placeId) return null;

  return {
    id: `place-${placeId}`,
    type: 'place',
    name: String(place.name || place.title || ''),
    location: String(place.location || place.address || ''),
    image_url: String(place.image_url || place.image || ''),
  };
}

function extractSavedPlaces(data: unknown) {
  const root = asRecord(data);
  const nestedData = asRecord(root.data);
  const list =
    nestedData.items ?? // 새로운 통합 API의 items 배열 우선
    nestedData.places ??
    nestedData.saved_places ??
    nestedData.favorites ??
    root.places ??
    root.saved_places ??
    root.favorites ??
    root.data ??
    [];

  return Array.isArray(list)
    ? list.map(normalizeSavedItem).filter((item): item is SavedItem => Boolean(item))
    : [];
}

async function fetchWithEndpointCandidates(
  endpoints: string[],
  build: (endpoint: string) => string,
  init?: RequestInit | ((endpoint: string) => RequestInit)
) {
  if (!API_BASE_URL) throw new Error('NEXT_PUBLIC_API_URL is not configured.');

  let lastResponse: Response | null = null;
  for (const endpoint of endpoints) {
    const requestInit = typeof init === 'function' ? init(endpoint) : init;
    const response = await fetch(`${API_BASE_URL}${build(endpoint)}`, requestInit);
    lastResponse = response;
    if (response.status !== 404 && response.status !== 405) return response;
  }
  return lastResponse;
}

export const useSavedStore = create<SavedState>()((set, get) => ({
  savedItems: [],
  isLoading: false,
  loadSavedItems: async () => {
    set({ isLoading: true });
    try {
      const response = await fetchWithEndpointCandidates(
        savedPlaceListEndpoints,
        (endpoint) => endpoint,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response?.ok) {
        set({ savedItems: [] });
        return;
      }

      const data = await response.json().catch(() => ({}));
      set({ savedItems: extractSavedPlaces(data) });
    } catch (error) {
      console.error('Failed to load saved places:', error);
      set({ savedItems: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  toggleItem: async (item) => {
    const wasSaved = get().isSaved(item.id);

    let endpoints: string[];
    let getEndpointPath: (endpoint: string) => string;
    let getBody: (endpoint: string) => BodyInit | null | undefined;

    if (item.type === 'festival') {
      const festivalId = item.id.replace(/^festival-/, '');
      endpoints = ['/api/likes/festivals'];
      getEndpointPath = (endpoint) => `${endpoint}/${festivalId}`;
      getBody = () => undefined; // POST/DELETE /api/likes/festivals/:id 는 body가 필요없음
    } else {
      const placeId = getPlaceId(item.id);
      const legacyEndpoints = savedPlaceListEndpoints.filter((endpoint) => endpoint !== '/api/likes');
      endpoints = wasSaved
        ? ['/api/likes', ...legacyEndpoints]
        : ['/api/likes', ...legacyEndpoints];
      getEndpointPath = (endpoint) => {
        if (endpoint === '/api/likes') return `${endpoint}/${placeId}`;
        return wasSaved ? `${endpoint}/${placeId}` : endpoint;
      };
      getBody = (endpoint) => (wasSaved || endpoint === '/api/likes' ? undefined : JSON.stringify({ place_id: placeId }));
    }

    try {
      const response = await fetchWithEndpointCandidates(
        endpoints,
        getEndpointPath,
        (endpoint) => ({
          method: wasSaved ? 'DELETE' : 'POST',
          headers: getAuthHeaders(),
          body: getBody(endpoint),
        })
      );

      if (!response?.ok) {
        throw new Error(`Saved place request failed: ${response?.status ?? 'unknown'}`);
      }

      set((state) => ({
        savedItems: wasSaved
          ? state.savedItems.filter((savedItem) => savedItem.id !== item.id)
          : [item, ...state.savedItems.filter((savedItem) => savedItem.id !== item.id)],
      }));
    } catch (error) {
      console.error('Failed to toggle saved place:', error);
    }
  },
  clearSavedItems: () => set({ savedItems: [] }),
  isSaved: (id) => get().savedItems.some((item) => item.id === id),
}));
