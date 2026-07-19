"use client";

import { useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { Popover } from "@base-ui/react/popover";
import { Plus, Trash2, X, ImageOff } from "lucide-react";
import { ICON_COMPONENTS, ICON_NAMES, iconSvgSpec } from "@/components/admin/tiptap-icons";
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
        className="mb-2 grid size-8 place-items-center rounded-lg border border-dashed border-admin-line text-gray-400 hover:border-primary/40 hover:text-primary"
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

function ItemsEditor({
  items,
  onChange,
  fields,
  addLabel,
  emptyItem,
  showIcon,
}: {
  items: BlockItem[];
  onChange: (items: BlockItem[]) => void;
  fields: FieldConfig[];
  addLabel: string;
  emptyItem: BlockItem;
  showIcon?: boolean;
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
          {showIcon && (
            <IconPickerButton
              value={item.icon || undefined}
              onChange={(name) => updateItem(idx, "icon", name ?? "")}
            />
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
        emptyItem={{ label: "", value: "", description: "" }}
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
        class: "not-prose my-4 grid grid-cols-1 gap-3 sm:grid-cols-2",
      }),
      ...items.map((item) => [
        "div",
        { class: "rounded-xl border border-primary/20 bg-primary/5 p-4" },
        ["p", { class: "text-xs font-medium text-gray-500" }, item.label || ""],
        ["p", { class: "mt-1 text-lg font-bold text-primary" }, item.value || ""],
        ["p", { class: "mt-1 text-xs leading-relaxed text-gray-500" }, item.description || ""],
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
