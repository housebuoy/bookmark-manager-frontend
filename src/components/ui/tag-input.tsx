"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { toast } from "sonner";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  limit?: number;
}

export default function TagInput({
  value,
  onChange,
  limit = 5,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = inputValue.trim();

      if (!newTag) return;
      if (value.includes(newTag)) {
        toast.info("Tag already added");
        return;
      }
      if (value.length >= limit) {
        toast.warning(`You can only add up to ${limit} tags`);
        return;
      }

      onChange([...value, newTag]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border rounded-md p-2">
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="flex items-center gap-1 pl-2 pr-1 py-0.5 text-sm"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => handleRemoveTag(tag)}
            className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-2.5 w-2.5 cursor-pointer " />
          </button>
        </Badge>
      ))}
      {value.length < limit && (
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Add tag and press Enter"
          className="flex-1 border-none shadow-none focus-visible:ring-0"
        />
      )}
    </div>
  );
}
