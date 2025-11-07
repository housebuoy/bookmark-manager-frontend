// src/stores/filter-store.ts
import { create } from "zustand";

interface FilterState {
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedTags: [],
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),
  clearTags: () => set({ selectedTags: [] }),
}));
