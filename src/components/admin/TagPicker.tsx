"use client";

import { useRef, useState, useTransition } from "react";
import { Combobox } from "@base-ui/react/combobox";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { searchTagsAction, findOrCreateTagAction, type TagOption } from "@/lib/actions/blog";

const CREATE_ID = "__create__";

interface TagPickerProps {
  value: TagOption[];
  onChange: (tags: TagOption[]) => void;
}

/** Multi-select tag picker — wrapper @base-ui/react/combobox mode `multiple`,
 * search async ke server + "buat tag baru" kalau nama belum ada. */
export function TagPicker({ value, onChange }: TagPickerProps) {
  const [searchResults, setSearchResults] = useState<TagOption[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trimmed = searchValue.trim();
  const exactMatch = searchResults.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());
  const alreadySelected = value.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());

  const items: (TagOption | { id: string; name: string })[] =
    trimmed && !exactMatch && !alreadySelected
      ? [...searchResults, { id: CREATE_ID, name: `Buat tag baru: "${trimmed}"` }]
      : searchResults;

  const runSearch = (query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const results = await searchTagsAction(query);
        setSearchResults(results);
      });
    }, 250);
  };

  const handleValueChange = async (next: (TagOption | { id: string; name: string })[]) => {
    const createItem = next.find((t) => t.id === CREATE_ID);
    if (createItem) {
      setCreating(true);
      const res = await findOrCreateTagAction(createItem.name.replace(/^Buat tag baru: "|"$/g, ""));
      setCreating(false);
      if (res.ok) {
        onChange([...value, res.tag]);
      }
      setSearchValue("");
      setSearchResults([]);
      return;
    }
    onChange(next as TagOption[]);
    setSearchValue("");
    setSearchResults([]);
  };

  return (
    <Combobox.Root
      items={items}
      value={value}
      multiple
      filter={null}
      itemToStringLabel={(t: TagOption | { id: string; name: string }) => t.name}
      isItemEqualToValue={(a: TagOption, b: TagOption) => a.id === b.id}
      onValueChange={handleValueChange}
      onInputValueChange={(next, { reason }) => {
        setSearchValue(next);
        if (reason === "item-press") return;
        if (!next.trim()) {
          setSearchResults([]);
          return;
        }
        runSearch(next.trim());
      }}
    >
      <Combobox.InputGroup
        data-slot="tag-picker-input-group"
        className="mt-1.5 flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border border-border/60 bg-background px-2 py-1.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      >
        <Combobox.Chips className="flex w-full flex-wrap items-center gap-1.5">
          <Combobox.Value>
            {(tags: TagOption[]) => (
              <>
                {tags.map((tag) => (
                  <Combobox.Chip
                    key={tag.id}
                    data-slot="tag-picker-chip"
                    aria-label={tag.name}
                    className="group flex items-center gap-1 rounded-md bg-primary/10 py-1 pl-2 pr-1 text-xs font-medium text-primary"
                  >
                    {tag.name}
                    <Combobox.ChipRemove
                      aria-label={`Hapus tag ${tag.name}`}
                      className="grid size-4 place-items-center rounded hover:bg-primary/20"
                    >
                      <X size={11} />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  placeholder={tags.length > 0 ? "" : "Cari atau buat tag..."}
                  className="h-6 min-w-24 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground"
                />
              </>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] rounded-lg border border-admin-line bg-popover text-sm shadow-lg">
            <div className="max-h-64 overflow-y-auto py-1">
              <Combobox.Status className="px-2.5 py-1.5 text-xs text-muted-foreground">
                {isPending || creating ? "Mencari..." : null}
              </Combobox.Status>
              <Combobox.Empty className="px-2.5 py-1.5 text-xs text-muted-foreground">
                {!isPending && trimmed && items.length === 0 ? "Tidak ada hasil." : null}
              </Combobox.Empty>
              <Combobox.List>
                {(tag: TagOption | { id: string; name: string }) => (
                  <Combobox.Item
                    key={tag.id}
                    value={tag}
                    className={cn(
                      "flex cursor-default items-center gap-2 px-2.5 py-1.5 text-sm outline-none select-none data-highlighted:bg-primary/5",
                      tag.id === CREATE_ID && "font-medium text-primary",
                    )}
                  >
                    <Combobox.ItemIndicator className="text-primary">
                      <Check size={13} />
                    </Combobox.ItemIndicator>
                    {tag.name}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </div>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
