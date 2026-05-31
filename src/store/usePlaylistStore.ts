import { create } from 'zustand';

interface PlaylistState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playlists: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setPlaylists: (updater: any[] | ((prev: any[]) => any[])) => void;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  playlists: [],
  setPlaylists: (updater) => set((state) => ({
    playlists: typeof updater === 'function' ? updater(state.playlists) : updater
  })),
}));
