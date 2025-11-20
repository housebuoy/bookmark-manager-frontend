"use client";

import { Globe, Share, Pin, ArchiveIcon } from "lucide-react";
import { FaHistory } from "react-icons/fa";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useBookmarkStore, Bookmark } from "@/stores/bookmark-store";
import { FaRegEye } from "react-icons/fa6";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { LinkPreview } from "@/components/ui/link-preview";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash, ExternalLink } from "lucide-react";
import { IoCalendarClearOutline } from "react-icons/io5";
import { format, formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { EditBookmarkModal } from "./edit-bookmark-modal";
import { ShareModal } from "@/components/ui/share-modal";

interface BookmarkCardProps {
  bookmark: Bookmark;
  layout?: "grid" | "list";
}

export const BookmarkCard = ({
  bookmark,
  layout = "grid",
}: BookmarkCardProps) => {
  const { togglePin, deleteBookmark, toggleArchive, incrementViewCount } =
    useBookmarkStore();
  const [open, setOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const openAndMark = (url: string, id: string) => {
    // Fire the request but don’t await — it will still be sent
    Promise.resolve(incrementViewCount(id)).catch((e) => console.error(e));
    // Open the link immediately
    window.open(url, "_blank", "noopener,noreferrer");
    console.log("Opened URL:", url);
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md flex flex-col h-full", // ✅ flex + full height
        layout === "list" ? "flex-col p-3" : "p-4"
      )}
    >
      {/* Header Row: favicon + title */}
      <div className="flex items-center gap-3 border-b pb-2">
        <div className="flex items-center justify-center w-12 h-12 rounded-md bg-muted shrink-0 ">
          {bookmark.favicon ? (
            <Image
              src={`https://icons.duckduckgo.com/ip3/${
                new URL(bookmark.url).hostname
              }.ico`}
              alt={bookmark.title}
              width={32}
              height={32}
              className="rounded-sm"
              unoptimized
            />
          ) : (
            <Globe className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <CardHeader className="p-0 flex-1 gap-0">
          <CardTitle className="text-lg font-semibold truncate">
            {bookmark.title}
          </CardTitle>
          <CardDescription>
            <LinkPreview
              url={bookmark.url}
              bookmarkId={bookmark.id}
              className="text-xs font-medium text-primary hover:underline block truncate cursor-pointer"
            >
              {bookmark.url
                ? (() => {
                    try {
                      return new URL(bookmark.url).hostname;
                    } catch {
                      return bookmark.url;
                    }
                  })()
                : ""}
            </LinkPreview>
          </CardDescription>
          <CardAction className="flex justify-end ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    openAndMark(bookmark.url, bookmark.id);
                  }}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setIsShareOpen(true)}
                >
                  <Share className="h-4 w-4 mr-2" /> Share
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <EditBookmarkModal bookmark={bookmark} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => toggleArchive(bookmark.id)}
                >
                  <ArchiveIcon className="h-4 w-4 mr-2" />{" "}
                  {bookmark.isArchived ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </DropdownMenuItem>
                <AlertDialog open={open} onOpenChange={setOpen}>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this bookmark? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setOpen(false)}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => deleteBookmark(bookmark.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
            <ShareModal
              open={isShareOpen}
              onOpenChange={setIsShareOpen}
              title={bookmark.title}
              url={bookmark.url}
              description={bookmark.description}
            />
          </CardAction>
        </CardHeader>
      </div>

      {/* Content Section — spans full width */}
      <CardContent className="p-0 -mt-4 space-y-1 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4 leading-snug">
          {bookmark.description}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {bookmark.tags?.map((tag) => (
            <span
              key={tag?.id}
              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
            >
              {tag?.name}
            </span>
          ))}
        </div>
      </CardContent>

      {/* Footer: Actions */}
      <div className="flex items-center justify-between border-t ">
        <div className="flex items-center text-xs text-muted-foreground py-1 gap-1 rounded-sm">
          <FaRegEye className="w-3 h-3" />
          <p>{bookmark.viewCount}</p>
        </div>
        <div className="flex items-center text-xs text-muted-foreground py-1 gap-1 rounded-sm">
          <FaHistory className="w-2.5 h-2.5" />
          <p className="text-xs text-muted-foreground">
            {bookmark.lastVisited
              ? `${formatDistanceToNow(new Date(bookmark.lastVisited), {
                  addSuffix: true,
                })}`
              : "Never visited"}
          </p>
        </div>
        <div className="flex items-center text-xs text-muted-foreground py-1 gap-1 rounded-sm">
          <IoCalendarClearOutline className="w-3 h-3" />
          <p>{format(new Date(bookmark.dateAdded), "MMM dd, yyyy")}</p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => togglePin(bookmark.id)}
          >
            <Pin
              className={`w-4 h-4 transition-transform duration-150 transform ${
                bookmark.isPinned
                  ? "rotate-45 text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
      </div>
    </Card>
  );
};
