"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { useBookmarkStore } from "@/stores/bookmark-store";

const SearchBar = () => {
  const setSearchQuery = useBookmarkStore((s) => s.setSearchQuery);

  return (
    <div>
      <Input
        type="text"
        placeholder="Search Bookmark"
        className="sm:w-96 w-52"
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
