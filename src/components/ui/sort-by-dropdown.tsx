import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BiSort } from "react-icons/bi"
import type { SortOption } from "@/stores/bookmark-store"

interface SortByDropdownProps {
  currentSort: SortOption
  onSortChange: (value: SortOption) => void
}

export function SortByDropdown({ currentSort, onSortChange }: SortByDropdownProps) {
  const sortOptions: { label: string; value: SortOption }[] = [
    { label: "Recently Added", value: "recently_added" },
    { label: "Recently Visited", value: "recently_visited" },
    { label: "Most Visited", value: "most_visited" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="gap-1 cursor-pointer bg-accent text-accent-foreground hover:bg-accent/30 flex items-center"
          variant="ghost"
        >
          <BiSort className="h-4 w-4" />
          <p>Sort by</p>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Sort Bookmarks</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={
              currentSort === option.value
                ? "bg-accent/20 font-medium"
                : "cursor-pointer"
            }
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
