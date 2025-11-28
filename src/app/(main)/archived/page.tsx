"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkCard } from "@/components/ui/bookmark-card";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { SortByDropdown } from "@/components/ui/sort-by-dropdown";
import Link from "next/link";

export default function ArchivedBookmarksPage() {
  const [isGrid, setIsGrid] = useState(true);
  const { loadBookmarks, filteredBookmarks, setShowArchived, sortBy, setSortBy } = useBookmarkStore();
  // Local loading state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadBookmarks();
      setLoading(false);
    };
    fetchData();

    // Show only archived bookmarks for this page
    setShowArchived(true);

    // Optional: reset to false on unmount so other pages don't show archived
    return () => setShowArchived(false);
  }, [loadBookmarks, setShowArchived]);

  const filtered = filteredBookmarks();

    const finalSortedBookmarks = [...filtered].sort((a, b) => {
    // 1. Priority: Pinned items always come first
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    // 2. Secondary: Apply the selected sort criteria
    switch (sortBy) {
      case "recently_visited":
        return (
          new Date(b.lastVisited || 0).getTime() -
          new Date(a.lastVisited || 0).getTime()
        );
      case "most_visited":
        return (b.viewCount || 0) - (a.viewCount || 0);
      case "recently_added":
      default:
        return (
          new Date(b.dateAdded || 0).getTime() -
          new Date(a.dateAdded || 0).getTime()
        );
    }
  });

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between ml-5">
        <h1 className="text-2xl font-semibold">Archived Bookmarks</h1>
        <div className="flex items-center justify-between gap-2">
          <SortByDropdown currentSort={sortBy} onSortChange={setSortBy} />
          <Button
            variant="ghost"
            aria-label="Toggle layout"
            onClick={() => setIsGrid(!isGrid)}
            className="gap-1 cursor-pointer bg-accent text-accent-foreground hover:bg-accent/30 flex items-center"
          >
            {isGrid ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            {isGrid ? <p>List</p> : <p>Grid</p>}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 border rounded-lg space-y-3">
              <Skeleton className="h-12 w-1/5" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-full mt-2" />
            </div>
          ))}
        </div>
      ) : finalSortedBookmarks.length === 0 ? (
        <div className="w-full mt-26 flex justify-center items-center">
          <p className="text-gray-500 p-6">No archived bookmarks found.</p>
          <Link href="/" passHref>
            <Button variant="secondary">
              View All Bookmarks
            </Button>
          </Link>
        </div>        
      ) : (
        <div
          className={`grid gap-4 p-6 ${isGrid ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
        >
          {finalSortedBookmarks.map((b, index) => (
            <BookmarkCard key={b.id ?? index} bookmark={b} />
          ))}
        </div>
      )}
    </div>
  );
}
