import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  toggleItem: (item: SavedItem) => void;
  isSaved: (id: string) => boolean;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set, get) => ({
      savedItems: [],
      toggleItem: (item) => {
        const { savedItems } = get();
        const exists = savedItems.find((i) => i.id === item.id);
        if (exists) {
          set({ savedItems: savedItems.filter((i) => i.id !== item.id) });
        } else {
          set({ savedItems: [item, ...savedItems] });
        }
      },
      isSaved: (id) => {
        return get().savedItems.some((i) => i.id === id);
      },
    }),
    {
      name: 'saved-storage',
    }
  )
);
