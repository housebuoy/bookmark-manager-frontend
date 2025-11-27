// store/bookmark-store.ts
import axios from "axios";
import { toast } from "sonner";
import { create } from "zustand";
import { authClient } from "@/lib/auth-client";

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
  // Optional properties for mapping consistency
  pinned?: boolean;
  archived?: boolean;
}

export type SortOption = "recently_added" | "recently_visited" | "most_visited";

interface BookmarkStore {
  bookmarks: Bookmark[];
  selectedTags: string[];
  sortBy: SortOption;
  addBookmark: (bookmark: Bookmark) => void;
  loadBookmarks: () => Promise<void>;
  updateBookmark: (id: string, updated: Partial<Bookmark>) => void;
  deleteBookmark: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  showArchived: boolean;
  setShowArchived: (value: boolean) => void;
  incrementViewCount: (id: string) => Promise<void>;
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

// Helper to get headers with User ID
const getAuthHeaders = async () => {
  const session = await authClient.getSession();
  const userId = session.data?.user?.id;

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return {
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };
};

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

  // Sync state update (API call handled in component)
  addBookmark: (bookmark) =>
    set((state): Partial<BookmarkStore> => {
      const exists = state.bookmarks.some(
        (b) => b.url.trim().toLowerCase() === bookmark.url.trim().toLowerCase()
      );

      if (exists) {
        toast.error("A bookmark with this link already exists.");
        return {};
      }

      return { bookmarks: [...state.bookmarks, bookmark] };
    }),

  // Sync state update (API call handled in component)
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
        return {};
      }

      return {
        bookmarks: state.bookmarks.map((b) =>
          b.id === id ? { ...b, ...updated } : b
        ),
      };
    }),

  deleteBookmark: async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`http://localhost:8080/api/bookmarks/${id}`, {
        headers,
      });
      
      set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id),
      }));
      toast.success("Bookmark deleted");
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
      toast.error("Failed to delete bookmark");
    }
  },

  togglePin: async (id: string) => {
    const { bookmarks } = get();
    const bookmark = bookmarks.find((b) => b.id === id);
    if (!bookmark) return;

    if (!bookmark.isPinned) {
      const pinnedCount = bookmarks.filter((b) => b.isPinned).length;
      if (pinnedCount >= MAX_PINNED) {
        toast.error(`You can only pin up to ${MAX_PINNED} bookmarks.`);
        return;
      }
    }

    try {
      const headers = await getAuthHeaders();
      // NOTE: Empty body {} is required for axios.patch to recognize the 3rd arg as config
      const { data: updated } = await axios.patch(
        `http://localhost:8080/api/bookmarks/${id}/pin`,
        {}, 
        { headers }
      );

      set({
        bookmarks: bookmarks.map((b) => (b.id === id ? updated : b)),
      });
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      toast.error("Failed to toggle pin");
    }
  },

  incrementViewCount: async (id: string) => {
    // optimistic update
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
      const headers = await getAuthHeaders();
      const { data: updated } = await axios.patch<Bookmark>(
        `http://localhost:8080/api/bookmarks/${id}/view`,
        {},
        { headers }
      );
      
      set((state) => ({
        bookmarks: state.bookmarks.map((b) => (b.id === id ? updated : b)),
      }));
    } catch (err) {
      console.error("Failed to increment view count:", err);
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
      const headers = await getAuthHeaders();
      const { data: updated } = await axios.patch<Bookmark>(
        `http://localhost:8080/api/bookmarks/${id}/archive`,
        {},
        { headers }
      );

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
      const headers = await getAuthHeaders();
      
      const { data } = await axios.get<Bookmark[]>(
        "http://localhost:8080/api/bookmarks",
        {
          headers,
        }
      );

      const mapped = data.map((b) => ({
        ...b,
        // Handle backend field mapping if needed
        isArchived: b.isArchived ?? b.archived ?? false,
        isPinned: b.isPinned ?? b.pinned ?? false,
      }));
      
      set({ bookmarks: mapped });
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
      // Optionally set an error state here
    }
  },

  loadPinnedBookmarks: async () => {
    try {
      const headers = await getAuthHeaders();
      const { data } = await axios.get<Bookmark[]>(
        "http://localhost:8080/api/bookmarks/pinned",
        { headers }
      );
      set({ pinnedBookmarks: data });
    } catch (err) {
      console.error("Failed to fetch pinned bookmarks:", err);
    }
  },
}));