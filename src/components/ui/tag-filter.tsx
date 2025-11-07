'use client';

import { useTags } from "@/lib/fetch-tags";
import { useBookmarkStore, Tag } from "@/stores/bookmark-store";
import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

function TagFilter() {
  const {  isLoading } = useTags();
  const { tagsWithCount, selectedTags, toggleTag } = useBookmarkStore();
  const tags = tagsWithCount();

  return (
    <ScrollArea className="h-96 pr-2">
      <SidebarMenuSub className="gap-2 mt-2 font-medium">
        {isLoading
          ? // --- Skeletons while loading ---
            Array.from({ length: 12 }).map((_, i) => (
              <SidebarMenuSubItem
                key={`skeleton-${i}`}
                className="flex items-center gap-3 py-1"
              >
                <div className="h-4 w-4 rounded-sm bg-muted/50 animate-pulse" />
                <div className="flex-1 h-3 rounded bg-muted/50 animate-pulse" />
                <div className="h-4 w-6 rounded bg-muted/50 animate-pulse" />
              </SidebarMenuSubItem>
            ))
          : (
          tags.map((tag: Tag) => (
            <SidebarMenuSubItem
              key={tag.id}
              className="flex items-center gap-3 font-extralight"
            >
              <Checkbox
                id={`tag-${tag.id}`}
                checked={selectedTags.includes(tag.name)}
                onCheckedChange={() => toggleTag(tag.name)}
                className="cursor-pointer "
              />
              <Label
                htmlFor={`tag-${tag.id}`}
                className="font-normal cursor-pointer"
              >
                {tag.name}
              </Label>
              <SidebarMenuBadge className="font-normal">
                {tag.count ?? 0}
              </SidebarMenuBadge>
            </SidebarMenuSubItem>
          ))
      )}
      </SidebarMenuSub>
    </ScrollArea>
  );
}

export default TagFilter;
