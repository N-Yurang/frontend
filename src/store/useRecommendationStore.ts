import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecommendedPlace {
  order: number;
  name: string;
  lat: number;
  lng: number;
  type: string;
  desc?: string;
  duration?: string;
}

interface RecommendationState {
  recommendations: RecommendedPlace[];
  setRecommendations: (recommendations: RecommendedPlace[]) => void;
  clearRecommendations: () => void;
}

export const useRecommendationStore = create<RecommendationState>()(
  persist(
    (set) => ({
      recommendations: [],
      setRecommendations: (recommendations) => set({ recommendations }),
      clearRecommendations: () => set({ recommendations: [] }),
    }),
    {
      name: 'recommendation-storage',
    }
  )
);
