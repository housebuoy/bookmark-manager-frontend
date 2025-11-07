import { useTags } from "@/lib/fetch-tags";
import { useFilterStore } from "@/stores/filter-store";

interface Tag {
  id: string | number;
  name: string;
}


function TagFilter() {
  const { data: tags = [], isLoading } = useTags();
  const { selectedTags, toggleTag } = useFilterStore();

  if (isLoading) return <p>Loading tags...</p>;

  return (
    <div className="flex flex-col gap-2">
      {tags.map((tag: Tag) => (
        <label key={tag.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedTags.includes(tag.name)}
            onChange={() => toggleTag(tag.name)}
          />
          <span>{tag.name}</span>
        </label>
      ))}
    </div>
  );
}

export default TagFilter;
