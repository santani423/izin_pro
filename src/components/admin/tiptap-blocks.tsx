"use client";

import { useRef, useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { Popover } from "@base-ui/react/popover";
import { Plus, Trash2, X, ImageOff, ImagePlus } from "lucide-react";
import { ICON_COMPONENTS, ICON_NAMES, iconSvgSpec } from "@/components/admin/tiptap-icons";
import { uploadBlogContentImageAction } from "@/lib/actions/blog";
import { cn } from "@/lib/utils";

/** Blok kustom Tiptap — "kartu" (card grid / step list / info box) yang bisa
 * diedit langsung di editor, dan HTML hasilnya sudah membawa class Tailwind
 * sendiri (dibangun di renderHTML) supaya tampil sama persis di halaman
 * publik lewat dangerouslySetInnerHTML — tanpa parsing tambahan di sana. */

type BlockItem = Record<string, string>;

interface FieldConfig {
  key: string;
  placeholder: string;
  type?: "input" | "textarea";
}

function IconPickerButton({
  value,
  onChange,
}: {
  value?: string;
  onChange: (name: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  const Selected = value ? ICON_COMPONENTS[value] : null;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        onKeyDown={stop}
        className="grid size-8 shrink-0 place-items-center rounded-lg border border-dashed border-admin-line text-gray-400 hover:border-primary/40 hover:text-primary"
        aria-label="Pilih ikon"
        title="Pilih ikon"
      >
        {Selected ? <Selected size={15} /> : <ImageOff size={14} />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={6} className="z-50 outline-none">
          <Popover.Popup className="w-56 rounded-lg border border-admin-line bg-white p-2 shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="grid grid-cols-6 gap-1">
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                onKeyDown={stop}
                className="grid size-7 place-items-center rounded-md text-gray-400 hover:bg-gray-50"
                title="Tanpa ikon"
              >
                <ImageOff size={13} />
              </button>
              {ICON_NAMES.map((name) => {
                const Icon = ICON_COMPONENTS[name];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    onKeyDown={stop}
                    className={cn(
                      "grid size-7 place-items-center rounded-md hover:bg-primary/10 hover:text-primary",
                      value === name ? "bg-primary/10 text-primary" : "text-gray-500",
                    )}
                    title={name}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

function ImageUploadField({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const res = await uploadBlogContentImageAction(fd);
    setUploading(false);
    if (res.ok) onChange(res.url);
  };

  const openPicker = (e: React.SyntheticEvent) => {
    stop(e);
    if (!uploading) inputRef.current?.click();
  };

  return (
    <div className="mb-2" onKeyDown={stop}>
      {value ? (
        <div className="relative">
          <img
            src={value}
            alt=""
            className="h-24 w-full rounded-md border border-admin-line object-cover"
          />
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="absolute inset-x-0 bottom-0 rounded-b-md bg-black/50 py-1 text-center text-[10px] font-semibold text-white disabled:pointer-events-none"
          >
            {uploading ? "Mengunggah..." : "Ganti gambar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-admin-line text-gray-400 hover:border-primary/40 hover:text-primary disabled:pointer-events-none"
        >
          <ImagePlus size={16} />
          <span className="text-[10px] font-semibold">{uploading ? "Mengunggah..." : "Unggah gambar"}</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onClick={stop}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ItemsEditor({
  items,
  onChange,
  fields,
  addLabel,
  emptyItem,
  showIcon,
  numbered,
  showImage,
}: {
  items: BlockItem[];
  onChange: (items: BlockItem[]) => void;
  fields: FieldConfig[];
  addLabel: string;
  emptyItem: BlockItem;
  showIcon?: boolean;
  numbered?: boolean;
  showImage?: boolean;
}) {
  const updateItem = (idx: number, key: string, value: string) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  };
  const removeItem = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const addItem = () => onChange([...items, { ...emptyItem }]);
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item, idx) => (
        <div key={idx} className="relative rounded-lg border border-admin-line bg-white p-3">
          <button
            type="button"
            onClick={() => removeItem(idx)}
            onKeyDown={stop}
            className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-md text-gray-300 hover:bg-red-50 hover:text-red-500"
            aria-label="Hapus item"
          >
            <X size={12} />
          </button>
          {showImage && (
            <ImageUploadField
              value={item.image || undefined}
              onChange={(url) => updateItem(idx, "image", url)}
            />
          )}
          {(numbered || showIcon) && (
            <div className="mb-2 flex items-center gap-2">
              {numbered && (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-[11px] font-bold text-white">
                  {idx + 1}
                </span>
              )}
              {showIcon && (
                <IconPickerButton
                  value={item.icon || undefined}
                  onChange={(name) => updateItem(idx, "icon", name ?? "")}
                />
              )}
            </div>
          )}
          {fields.map((f) =>
            f.type === "textarea" ? (
              <textarea
                key={f.key}
                value={item[f.key] ?? ""}
                onChange={(e) => updateItem(idx, f.key, e.target.value)}
                onKeyDown={stop}
                placeholder={f.placeholder}
                rows={2}
                className="mt-1 w-full resize-none rounded-md border-0 bg-transparent p-0 pr-5 text-xs leading-relaxed text-gray-500 outline-none placeholder:text-gray-300"
              />
            ) : (
              <input
                key={f.key}
                value={item[f.key] ?? ""}
                onChange={(e) => updateItem(idx, f.key, e.target.value)}
                onKeyDown={stop}
                placeholder={f.placeholder}
                className="w-full rounded-md border-0 bg-transparent p-0 pr-5 text-sm font-semibold text-gray-900 outline-none placeholder:text-gray-300"
              />
            ),
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1 self-start rounded-lg border border-dashed border-admin-line px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5 sm:col-span-2"
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

function BlockShell({
  label,
  onDelete,
  children,
}: {
  label: string;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <NodeViewWrapper className="not-prose my-4 rounded-xl border border-dashed border-admin-line bg-gray-50/40 p-3" contentEditable={false}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</span>
        <button
          type="button"
          onClick={onDelete}
          className="grid size-6 place-items-center rounded-md text-gray-300 hover:bg-red-50 hover:text-red-500"
          aria-label={`Hapus blok ${label}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
      {children}
    </NodeViewWrapper>
  );
}

/* ═══ 1. Card Grid — grid kartu judul + deskripsi (mis. "Syarat Mengurus") ═══ */

function CardGridView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items: BlockItem[] = node.attrs.items ?? [];
  return (
    <BlockShell label="Card Grid" onDelete={deleteNode}>
      <ItemsEditor
        items={items}
        onChange={(next) => updateAttributes({ items: next })}
        fields={[
          { key: "title", placeholder: "Judul kartu", type: "input" },
          { key: "description", placeholder: "Deskripsi singkat...", type: "textarea" },
        ]}
        addLabel="Tambah Kartu"
        emptyItem={{ icon: "", title: "", description: "" }}
        showIcon
      />
    </BlockShell>
  );
}

export const CardGrid = Node.create({
  name: "cardGrid",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="card-grid"]' }];
  },
  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const items: BlockItem[] = node.attrs.items ?? [];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "card-grid",
        class: "not-prose my-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
      }),
      ...items.map((item) => {
        const children: unknown[] = [];
        if (item.icon) {
          children.push([
            "div",
            { class: "flex size-9 items-center justify-center rounded-lg border border-primary/30 text-primary" },
            iconSvgSpec(item.icon, "size-4"),
          ]);
        }
        children.push(["p", { class: "mt-2 text-xs font-bold text-gray-900" }, item.title || ""]);
        children.push(["p", { class: "mt-1 text-[11px] leading-relaxed text-gray-500" }, item.description || ""]);
        return [
          "div",
          { class: "flex h-full flex-col items-center rounded-xl border border-gray-200 px-3 py-4 text-center" },
          ...children,
        ];
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(CardGridView);
  },
});

/* ═══ 2. Step List — daftar langkah bernomor (mis. "Langkah Mengurus NIB") ═══ */

function StepListView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items: BlockItem[] = node.attrs.items ?? [];
  return (
    <BlockShell label="Step List" onDelete={deleteNode}>
      <ItemsEditor
        items={items}
        onChange={(next) => updateAttributes({ items: next })}
        fields={[
          { key: "title", placeholder: "Judul langkah", type: "input" },
          { key: "description", placeholder: "Penjelasan langkah...", type: "textarea" },
        ]}
        addLabel="Tambah Langkah"
        emptyItem={{ icon: "", title: "", description: "" }}
        numbered
        showIcon
      />
    </BlockShell>
  );
}

export const StepList = Node.create({
  name: "stepList",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="step-list"]' }];
  },
  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const items: BlockItem[] = node.attrs.items ?? [];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "step-list",
        class: "not-prose my-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6",
      }),
      ...items.map((item, i) => {
        const circle = item.icon
          ? [
              "span",
              {
                class:
                  "grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-primary shadow-sm",
              },
              iconSvgSpec(item.icon, "size-5"),
            ]
          : [
              "span",
              {
                class:
                  "grid size-11 place-items-center rounded-full border border-primary/30 bg-white text-sm font-bold text-primary shadow-sm",
              },
              String(i + 1),
            ];
        const badge = item.icon
          ? [
              "span",
              {
                class:
                  "absolute -left-1.5 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white",
              },
              String(i + 1),
            ]
          : "";
        const connector =
          i < items.length - 1
            ? [
                "div",
                {
                  class:
                    "absolute left-[calc(50%+1.875rem)] right-[calc(-50%+1.875rem)] top-[1.375rem] hidden -translate-y-1/2 items-center lg:flex",
                  "aria-hidden": "true",
                },
                ["span", { class: "flex-1 border-t-2 border-dashed border-primary/40" }],
                [
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    width: "16",
                    height: "16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    "stroke-width": "2",
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    class: "-ml-1.5 shrink-0 text-primary/60",
                  },
                  ["path", { d: "m9 18 6-6-6-6" }],
                ],
              ]
            : "";
        return [
          "div",
          { class: "relative flex flex-col items-center text-center" },
          connector,
          ["div", { class: "relative" }, circle, badge],
          ["p", { class: "mt-2 text-xs font-bold text-gray-900" }, item.title || ""],
          ["p", { class: "mt-1 text-[11px] leading-relaxed text-gray-500" }, item.description || ""],
        ];
      }),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(StepListView);
  },
});

/* ═══ 3. Info Box — kotak sorot label + nilai (mis. "Biaya & Waktu Proses") ═══ */

function InfoBoxView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items: BlockItem[] = node.attrs.items ?? [];
  return (
    <BlockShell label="Info Box" onDelete={deleteNode}>
      <ItemsEditor
        items={items}
        onChange={(next) => updateAttributes({ items: next })}
        fields={[
          { key: "label", placeholder: "Label, mis. Biaya", type: "input" },
          { key: "value", placeholder: "Nilai, mis. GRATIS", type: "input" },
          { key: "description", placeholder: "Keterangan...", type: "textarea" },
        ]}
        addLabel="Tambah Info"
        emptyItem={{ icon: "", image: "", label: "", value: "", description: "" }}
        showIcon
        showImage
      />
    </BlockShell>
  );
}

export const InfoBox = Node.create({
  name: "infoBox",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="info-box"]' }];
  },
  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const items: BlockItem[] = node.attrs.items ?? [];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "info-box",
        class: "not-prose my-4 grid grid-cols-1 gap-4 sm:grid-cols-2",
      }),
      ...items.map((item) => [
        "div",
        { class: "flex items-center gap-4 rounded-xl bg-brand-surface px-5 py-5" },
        [
          "div",
          { class: "min-w-0 flex-1" },
          [
            "p",
            { class: "flex items-center gap-1.5 text-xs font-semibold text-foreground" },
            ...(item.icon ? [iconSvgSpec(item.icon, "size-3.5 text-primary")] : []),
            item.label || "",
          ],
          ["p", { class: "mt-2 text-2xl font-extrabold tracking-tight text-primary" }, item.value || ""],
          ["p", { class: "mt-1.5 text-sm leading-relaxed text-muted-foreground" }, item.description || ""],
        ],
        item.image
          ? [
              "img",
              {
                src: item.image,
                alt: item.label || "",
                width: "112",
                height: "112",
                class: "h-24 w-24 shrink-0 rounded-lg object-cover sm:h-28 sm:w-28",
              },
            ]
          : "",
      ]),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(InfoBoxView);
  },
});

/* ═══ 4. FAQ List — accordion tanya-jawab (mis. "FAQ Seputar NIB") ═══ */

function FaqListView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const items: BlockItem[] = node.attrs.items ?? [];
  return (
    <BlockShell label="FAQ List" onDelete={deleteNode}>
      <ItemsEditor
        items={items}
        onChange={(next) => updateAttributes({ items: next })}
        fields={[
          { key: "question", placeholder: "Pertanyaan...", type: "input" },
          { key: "answer", placeholder: "Jawaban...", type: "textarea" },
        ]}
        addLabel="Tambah FAQ"
        emptyItem={{ question: "", answer: "" }}
      />
    </BlockShell>
  );
}

export const FaqList = Node.create({
  name: "faqList",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (el) => {
          try {
            return JSON.parse(el.getAttribute("data-items") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attrs) => ({ "data-items": JSON.stringify(attrs.items ?? []) }),
      },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="faq-list"]' }];
  },
  renderHTML({ node, HTMLAttributes }): DOMOutputSpec {
    const items: BlockItem[] = node.attrs.items ?? [];
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "faq-list",
        class: "not-prose my-4 divide-y divide-gray-200 rounded-xl border border-gray-200",
      }),
      ...items.map((item) => [
        "details",
        { class: "group p-4" },
        [
          "summary",
          { class: "flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-gray-900" },
          item.question || "",
          [
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "16",
              height: "16",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              class: "shrink-0 text-gray-400 transition-transform group-open:rotate-180",
            },
            ["path", { d: "m6 9 6 6 6-6" }],
          ],
        ],
        ["p", { class: "mt-2 text-xs leading-relaxed text-gray-500" }, item.answer || ""],
      ]),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(FaqListView);
  },
});
