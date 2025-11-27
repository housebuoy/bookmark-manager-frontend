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
import { FaPlus, FaWandMagicSparkles } from "react-icons/fa6"; // Added Magic Icon
import { Loader2 } from "lucide-react"; // Added Loader
import { toast } from "sonner";
import TagInput from "./tag-input";
import { authClient } from "@/lib/auth-client";

interface AddBookmarkButtonProps {
  showText?: boolean;
}

export function AddBookmarkModal({ showText = true }: AddBookmarkButtonProps) {
  const addBookmark = useBookmarkStore((state) => state.addBookmark);
  const [open, setOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false); // Loading state
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

  // ✨ New Function: Handle Auto-Fill
  const handleAutoFill = async () => {
    let urlToScrape = form.url.trim();

    if (!urlToScrape) {
      toast.error("Please enter a URL first");
      return;
    }

    if (
      !urlToScrape.startsWith("http://") &&
      !urlToScrape.startsWith("https://")
    ) {
      urlToScrape = "https://" + urlToScrape;
      // Update form state so the user sees the change
      setForm((prev) => ({ ...prev, url: urlToScrape }));
    }

    setIsScraping(true);
    try {
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

      if (!userId) {
        toast.error("You must be logged in.");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/scraper/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId,
          },
          body: JSON.stringify({ url: form.url }),
        }
      );

      if (!response.ok) throw new Error("Failed to scrape site");

      const data = await response.json();

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        description: data.description || prev.description,
        // Join the list of matched tags into a string for the TagInput
        tags: data.tags ? data.tags.join(",") : prev.tags,
      }));

      toast.success("Details auto-filled!");
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch site details.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = await authClient.getSession();
    const userId = session.data?.user?.id;

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    const payload = {
      title: form.title,
      url: form.url,
      description: form.description,
      favicon: `https://www.google.com/s2/favicons?sz=64&domain_url=${form.url}`,
      isPinned: false,
      isArchived: false,
      viewCount: 0,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch("http://localhost:8080/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": userId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save bookmark", errorText);
        toast.error("Failed to save bookmark.");
        return;
      }

      const savedBookmark = await response.json();

      addBookmark({
        ...savedBookmark,
        lastVisited: savedBookmark.lastVisited ?? null,
        dateAdded: savedBookmark.dateAdded ?? null,
      });

      toast.success("Bookmark saved successfully!");
      setForm({ title: "", url: "", description: "", tags: "" });
      setOpen(false);
    } catch (err) {
      console.error("Error saving bookmark:", err);
      toast.error("An unexpected error occurred.");
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
            <Label htmlFor="url">URL</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                name="url"
                type="url"
                value={form.url}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAutoFill}
                disabled={isScraping || !form.url}
                title="Auto-fill details from URL"
              >
                {isScraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FaWandMagicSparkles className="h-4 w-4 text-indigo-600" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Website Title"
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
