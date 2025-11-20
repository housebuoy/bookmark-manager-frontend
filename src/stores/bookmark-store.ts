// store/bookmark-store.ts
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";

export interface Tag {
  id: number | string;
  name: string;
  count?: number;
}

export interface Bookmark {
  id: string;
  title: string;
  description: string;
  url: string;
  favicon?: string;
  tags: Tag[];
  isPinned: boolean;
  isArchived: boolean;
  viewCount: number;
  lastVisited: string;
  dateAdded: string;
  pinned?: boolean;
  archived: boolean;
}

export type SortOption = "recently_added" | "recently_visited" | "most_visited";

interface BookmarkStore {
  bookmarks: Bookmark[];
  selectedTags: string[];
  sortBy: SortOption;
  addBookmark: (bookmark: Bookmark) => void;
  loadBookmarks: () => Promise<void>;
  updateBookmark: (id: string, updated: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => void;
  togglePin: (id: string) => void;
  toggleArchive: (id: string) => void;
  showArchived: boolean;
  setShowArchived: (value: boolean) => void;
  incrementViewCount: (id: string) => void;
  setSortBy: (option: SortOption) => void;
  sortedBookmarks: () => Bookmark[];
  toggleTag: (tag: string) => void;
  tagsWithCount: () => Tag[];
  filteredBookmarks: () => Bookmark[];
  pinnedBookmarks: Bookmark[];
  loadPinnedBookmarks: () => Promise<void>;
  refreshKey: number;
  searchQuery?: string;
  setSearchQuery: (value: string) => void;
}
const MAX_PINNED = 5;

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  selectedTags: [],
  sortBy: "recently_added",
  showArchived: false,
  setShowArchived: (value: boolean) => set({ showArchived: value }),
  pinnedBookmarks: [],
  refreshKey: 0,
  searchQuery: "",
  setSearchQuery: (value) => set({ searchQuery: value }),

  addBookmark: (bookmark) =>
    set((state): Partial<BookmarkStore> => {
      const exists = state.bookmarks.some(
        (b) => b.url.trim().toLowerCase() === bookmark.url.trim().toLowerCase()
      );

      if (exists) {
        toast.error("A bookmark with this link already exists.");
        return {}; // Return empty object instead of void
      }

      return { bookmarks: [...state.bookmarks, bookmark] };
    }),

  updateBookmark: (id, updated) =>
    set((state): Partial<BookmarkStore> => {
      const updatedUrl = updated.url?.trim().toLowerCase();

      if (
        updatedUrl &&
        state.bookmarks.some(
          (b) => b.id !== id && b.url.trim().toLowerCase() === updatedUrl
        )
      ) {
        toast.error("A bookmark with this link already exists.");
        return {}; // ✅ void = skip update
      }

      return {
        bookmarks: state.bookmarks.map((b) =>
          b.id === id ? { ...b, ...updated } : b
        ),
      };
    }),

  deleteBookmark: async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/bookmarks/${id}`);
      // Remove from local state
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
    }
  },

  togglePin: async (id: string) => {
    const { bookmarks } = get();
    const bookmark = bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    // 🚫 Prevent pinning more than limit
    if (!bookmark.isPinned) {
      const pinnedCount = bookmarks.filter((b) => b.isPinned).length;
      if (pinnedCount >= MAX_PINNED) {
        toast.error(`You can only pin up to ${MAX_PINNED} bookmarks.`);
        return;
      }
    }

    try {
      const { data: updated } = await axios.patch(
        `http://localhost:8080/api/bookmarks/${id}/pin`
      );

      set({
        bookmarks: bookmarks.map((b) => (b.id === id ? updated : b)),
      });
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  },

  incrementViewCount: async (id: string) => {
    // optimistic update: increment local immediately
    set((state) => ({
      bookmarks: state.bookmarks.map((b) =>
        b.id === id
          ? {
              ...b,
              viewCount: b.viewCount + 1,
              lastVisited: new Date().toISOString(),
            }
          : b
      ),
    }));

    try {
      const { data: updated } = await axios.patch<Bookmark>(
        `http://localhost:8080/api/bookmarks/${id}/view`
      );
      // sync with backend response (in case server has canonical time)
      set((state) => ({
        bookmarks: state.bookmarks.map((b) => (b.id === id ? updated : b)),
      }));
    } catch (err) {
      console.error("Failed to increment view count:", err);
      // optional: roll back optimistic increment on failure
      // set((state) => ({ bookmarks: state.bookmarks.map(b => b.id === id ? { ...b, viewCount: Math.max(0, b.viewCount - 1) } : b) }));
    }
  },

  setSortBy: (option) => set({ sortBy: option }),

  sortedBookmarks: () => {
    const { bookmarks, sortBy } = get();
    switch (sortBy) {
      case "recently_visited":
        return [...bookmarks].sort(
          (a, b) =>
            new Date(b.lastVisited).getTime() -
            new Date(a.lastVisited).getTime()
        );
      case "most_visited":
        return [...bookmarks].sort((a, b) => b.viewCount - a.viewCount);
      case "recently_added":
      default:
        return [...bookmarks].sort(
          (a, b) =>
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
    }
  },

  // 🧩 Filtering logic
  toggleTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((t) => t !== tag)
        : [...state.selectedTags, tag],
    })),

  tagsWithCount: () => {
    const { bookmarks } = get();
    const tagCount: Record<string, number> = {};

    bookmarks.forEach((bookmark) => {
      bookmark.tags.forEach((tag) => {
        tagCount[tag.name] = (tagCount[tag.name] || 0) + 1;
      });
    });

    // return unique tags with counts
    return Object.entries(tagCount).map(([name, count], index) => ({
      id: `${index}`,
      name,
      count,
    }));
  },

  toggleArchive: async (id) => {
    const bookmark = get().bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    try {
      const { data: updated } = await axios.patch<Bookmark>(
        `http://localhost:8080/api/bookmarks/${id}/archive`
      );

      // Force unpin if the bookmark is now archived
      const modified = updated.isArchived
        ? { ...updated, isPinned: false }
        : updated;

      set({
        bookmarks: get().bookmarks.map((b) => (b.id === id ? modified : b)),
      });

      if (modified.isArchived) {
        toast.info("Bookmark archived and unpinned");
      } else {
        toast.success("Bookmark restored");
      }

      // Refresh bookmarks
      set((state) => ({
        refreshKey: state.refreshKey + 1,
      }));
    } catch (err) {
      console.error("Failed to toggle archive:", err);
      toast.error("Failed to update bookmark");
    }
  },

  filteredBookmarks: () => {
    const { bookmarks, selectedTags, showArchived, searchQuery } = get();

    return bookmarks.filter((b) => {
      const archiveCheck = showArchived ? b.isArchived : !b.isArchived;

      const tagCheck =
        selectedTags.length === 0 ||
        b.tags.some((t) => selectedTags.includes(t.name));

      const search =
        (searchQuery ?? "").trim().length === 0 ||
        b.title.toLowerCase().includes((searchQuery ?? "").toLowerCase()) ||
        b.description
          .toLowerCase()
          .includes((searchQuery ?? "").toLowerCase()) ||
        b.url.toLowerCase().includes((searchQuery ?? "").toLowerCase());

      return archiveCheck && tagCheck && search;
    });
  },

  loadBookmarks: async () => {
    try {
      const { data } = await axios.get("http://localhost:8080/api/bookmarks");
      // map `archived` from backend to `isArchived` in frontend
      const mapped = data.map((b: Bookmark) => ({
        ...b,
        isArchived: b.archived ?? false,
      }));
      set({ bookmarks: mapped });
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  },
  loadPinnedBookmarks: async () => {
    try {
      const { data } = await axios.get<Bookmark[]>(
        "http://localhost:8080/api/bookmarks/pinned"
      );
      set({ pinnedBookmarks: data });
    } catch (err) {
      console.error("Failed to fetch pinned bookmarks:", err);
    }
  },

}));
