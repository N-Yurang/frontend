import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecommendedPlace {
  place_id?: string | number;
  order: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  desc?: string;
  duration?: string;
  image_url?: string;
  category?: string;
  tags?: string[];
  memo?: string;
}

interface RecommendationState {
  recommendations: RecommendedPlace[];
  tripTitle: string;
  setRecommendations: (recommendations: RecommendedPlace[], title?: string) => void;
  clearRecommendations: () => void;
  resetForNewUser: () => void;
}

export const useRecommendationStore = create<RecommendationState>()(
  persist(
    (set) => ({
      recommendations: [],
      tripTitle: "AI 추천 여행 코스",
      setRecommendations: (recommendations, title) => set({ recommendations, tripTitle: title || "AI 추천 여행 코스" }),
      clearRecommendations: () => set({ recommendations: [], tripTitle: "AI 추천 여행 코스" }),
      resetForNewUser: () => set({ recommendations: [], tripTitle: "AI 추천 여행 코스" }),
    }),
    {
      name: 'recommendation-storage',
    }
  )
);
