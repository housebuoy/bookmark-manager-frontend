"use client";

import { useState } from "react";
import { useBookmarkStore } from "@/stores/bookmark-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FaPlus } from "react-icons/fa6";
import { toast } from "sonner";
import TagInput from "./tag-input";

interface AddBookmarkButtonProps {
  showText?: boolean; // optional prop, default to true
}

export function AddBookmarkModal({ showText = true }: AddBookmarkButtonProps) {
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    description: "",
    tags: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload without id, lastVisited, or dateAdded
    const payload = {
      title: form.title,
      url: form.url,
      description: form.description,
      favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${form.url}`,
      isPinned: false,
      isArchived: false,
      viewCount: 0,
      tags: form.tags.split(",").map((tag) => tag.trim()),
    };

    try {
      const response = await fetch("http://localhost:8080/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Show full error
        const errorText = await response.text();
        console.error("Failed to save bookmark", errorText);
        return;
      }

      const savedBookmark = await response.json();

      // Add the new bookmark to Zustand store
      addBookmark({
        ...savedBookmark,
        lastVisited: savedBookmark.lastVisited ?? null,
        dateAdded: savedBookmark.dateAdded ?? null,
      });

      setForm({ title: "", url: "", description: "", tags: "" });
      setOpen(false);
    } catch (err) {
      console.error("Error saving bookmark:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`
            bg-[#054744] text-white hover:bg-[#054744]/90 font-semibold cursor-pointer
            flex items-center justify-center
            ${!showText ? "py-8 text-2xl" : "py-5 px-6 text-md"}
          `}
        >
          <FaPlus
            size={showText ? 20 : 80}
            className={showText ? "mr-2" : "block"}
          />
          {showText && "Add Bookmark"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Bookmark</DialogTitle>
          <DialogDescription>
            Save a website to your bookmarks collection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter website title"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              name="url"
              type="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={(e) => {
                if (e.target.value.length <= 200) {
                  handleChange(e);
                } else {
                  toast.info("Description is limited to 200 characters");
                }
              }}
              placeholder="Short description..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {form.description.length}/200 characters
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              value={form.tags.split(",").filter(Boolean)}
              onChange={(tags) =>
                setForm((prev) => ({ ...prev, tags: tags.join(",") }))
              }
              limit={5}
            />
          </div>

          <Button type="submit" className="w-full">
            Save Bookmark
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
