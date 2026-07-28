"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── List drag-and-drop generik (@dnd-kit) ───
 * Dipakai berulang di editor konten detail layanan (highlights, stats,
 * benefit items, jenis layanan, langkah proses, dokumen, dst) + FAQ &
 * daftar Layanan admin — satu implementasi drag, bukan diulang di tiap
 * section. Item ketuker urutannya langsung lewat onReorder (array baru,
 * caller yg nyimpen state/manggil server action). */
export function SortableList<T>({
  id,
  items,
  getId,
  onReorder,
  renderItem,
  disabled,
  className,
}: {
  /** Id stabil unik per instance — dnd-kit generate id aria-describedby
   * pakai counter modul internal (bukan React useId), gak SSR-safe kalau
   * dibiarkan auto. Wajib diisi biar server/client gak mismatch pas hydrate
   * ketika ada >1 SortableList dalam satu halaman. */
  id: string;
  items: T[];
  getId: (item: T) => string;
  onReorder: (nextItems: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => getId(item) === active.id);
    const newIndex = items.findIndex((item) => getId(item) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = [...items];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    onReorder(next);
  };

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        <div className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <SortableRow key={getId(item)} id={getId(item)} disabled={disabled}>
              {renderItem(item, index)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("flex items-start gap-2 rounded-xl", isDragging && "z-10 opacity-90 shadow-lg")}
    >
      {!disabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-3 flex-shrink-0 cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing"
          aria-label="Seret untuk mengubah urutan"
        >
          <GripVertical size={16} />
        </button>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
