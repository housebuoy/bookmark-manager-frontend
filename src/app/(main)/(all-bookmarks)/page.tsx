"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import { useEffect, useState } from "react";
import { BookmarkCard } from "@/components/ui/bookmark-card";
import { useBookmarkStore } from "@/stores/bookmark-store";
import { Skeleton } from "@/components/ui/skeleton";
import { SortByDropdown } from "@/components/ui/sort-by-dropdown";

export default function Home() {
  const [isGrid, setIsGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const { loadBookmarks, filteredBookmarks, sortBy, setSortBy, refreshKey } =
    useBookmarkStore();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadBookmarks();
      setLoading(false);
    };
    fetchData();
  }, [loadBookmarks, refreshKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

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

  const totalItems = finalSortedBookmarks.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Slice the sorted list to get only the items for the current page
  const paginatedBookmarks = finalSortedBookmarks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex justify-between ml-5">
        <h1 className="text-2xl font-semibold">All Bookmarks</h1>
        <div className="flex items-center justify-between gap-2">
          <SortByDropdown currentSort={sortBy} onSortChange={setSortBy} />
          <Button
            variant="ghost"
            aria-label="Toggle layout"
            onClick={() => setIsGrid(!isGrid)}
            className="gap-1 hidden sm:flex cursor-pointer bg-accent text-accent-foreground hover:bg-accent/30 items-center"
          >
            {isGrid ? (
              <List className="h-5 w-5" />
            ) : (
              <Grid className="h-5 w-5" />
            )}
            {isGrid ? <p>List</p> : <p>Grid</p>}
          </Button>
        </div>
      </div>

      {/* --- Loading Skeletons --- */}
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
      ) : finalSortedBookmarks.map.length === 0 ? (
        <p className="text-gray-500 p-6">No bookmarks found.</p>
      ) : (
        <div
          className={`grid gap-4 p-6 ${
            isGrid ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          }`}
        >
          {paginatedBookmarks.map((b, index) => (
            <BookmarkCard key={b.id ?? index} bookmark={b} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
