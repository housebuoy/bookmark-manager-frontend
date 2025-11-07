"use client";

import { useState } from "react";
import { useBookmarkStore, Bookmark } from "@/stores/bookmark-store";
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
import { Pencil } from "lucide-react";
import TagInput from "./tag-input";
import { toast } from "sonner";

interface EditBookmarkModalProps {
  bookmark: Bookmark;
}

export function EditBookmarkModal({ bookmark }: EditBookmarkModalProps) {
  const updateBookmark = useBookmarkStore((state) => state.updateBookmark);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description ?? "",
    tags: bookmark.tags?.map(tag => tag?.name).join(", ") ?? "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...bookmark,
      title: form.title,
      url: form.url,
      description: form.description,
      favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${form.url}`,
      tags: form.tags.split(",").map(tag => tag.trim()),
    };

    try {
      const res = await fetch(`http://localhost:8080/api/bookmarks/${bookmark.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Failed to update bookmark", await res.text());
        return;
      }

      const updated = await res.json();
      // call the store updater with the bookmark id and updated data,
      // using optional chaining to guard against it being undefined
      updateBookmark?.(bookmark.id, updated);
      setOpen(false);

    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="cursor-pointer  rounded  font-normal text-sm w-full justify-start">
          <Pencil className="h-4 w-4 mr-2 text-[#555555] dark:text-[#aeaeae]" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>Update bookmark information.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input name="title" value={form.title} onChange={handleChange} />
          </div>

          <div className="grid gap-2">
            <Label>URL</Label>
            <Input name="url" value={form.url} onChange={handleChange} />
          </div>

          <div className="grid gap-2">
            <Label>Description</Label>
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
            <Label>Tags</Label>
            <TagInput
              value={form.tags.split(",").filter(Boolean)}
              onChange={(tags) =>
                setForm((prev) => ({ ...prev, tags: tags.join(",") }))
              }
              limit={5}
            />
          </div>

          <Button type="submit" className="w-full">Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
