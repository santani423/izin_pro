"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { TableKit } from "@tiptap/extension-table";
import { CardGrid, StepList, InfoBox, FaqList } from "@/components/admin/tiptap-blocks";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code2,
  LinkIcon,
  ImageIcon,
  Highlighter,
  Table2,
  LayoutGrid,
  Milestone,
  Info,
  HelpCircle,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadBlogContentImageAction } from "@/lib/actions/blog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

const BLOCK_TYPE_ITEMS: Record<string, string> = {
  paragraph: "Normal Text",
  h2: "Heading 2",
  h3: "Heading 3",
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

/** Editor rich text utk isi artikel blog — Tiptap, output HTML polos
 * (disimpan ke BlogPost.content yang bertipe String, bukan Json). */
export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const [fullscreen, setFullscreen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Image,
      Underline,
      Highlight,
      TableKit.configure({ table: { resizable: true } }),
      CardGrid,
      StepList,
      InfoBox,
      FaqList,
      Placeholder.configure({ placeholder: "Tulis isi artikel di sini..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[320px] px-3.5 py-3 focus:outline-none [&_p]:my-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3 [&_h3]:mb-1.5 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:p-2 [&_th]:text-left",
      },
    },
  });

  useEffect(() => {
    if (!fullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [fullscreen]);

  if (!editor) return null;

  const activeBlockType = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "paragraph";

  const setBlockType = (value: string) => {
    if (value === "paragraph") editor.chain().focus().setParagraph().run();
    else if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
  };

  const addLink = () => {
    const url = window.prompt("URL link:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadBlogContentImageAction(fd);
      if (res.ok) {
        editor.chain().focus().setImage({ src: res.url }).run();
      }
    };
    input.click();
  };

  const insertCardGrid = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "cardGrid",
        attrs: { items: [{ title: "", description: "" }, { title: "", description: "" }] },
      })
      .run();
  };

  const insertStepList = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "stepList",
        attrs: { items: [{ title: "", description: "" }, { title: "", description: "" }] },
      })
      .run();
  };

  const insertInfoBox = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "infoBox",
        attrs: { items: [{ label: "", value: "", description: "" }] },
      })
      .run();
  };

  const insertFaqList = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "faqList",
        attrs: { items: [{ question: "", answer: "" }, { question: "", answer: "" }] },
      })
      .run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <>
      {fullscreen && (
        <div className="fixed inset-0 z-[99] bg-black/30" onClick={() => setFullscreen(false)} />
      )}
      <div
        className={cn(
          "mt-1.5 flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white",
          fullscreen ? "fixed inset-6 z-[100] mt-0 shadow-2xl" : "h-full min-h-0",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-0.5 border-b border-admin-line bg-gray-50/50 px-1.5 py-1">
          <Select items={BLOCK_TYPE_ITEMS} value={activeBlockType} onValueChange={(v) => v && setBlockType(v)}>
            <SelectTrigger className="mr-1 h-8 w-[124px] rounded-lg border-border/60 bg-white px-2 text-xs font-medium hover:border-primary/40 focus-visible:border-primary focus-visible:ring-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false} align="start">
              {Object.entries(BLOCK_TYPE_ITEMS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mx-0.5 h-5 w-px bg-admin-line" />
          <ToolbarButton
            label="Bold"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Italic"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={15} />
          </ToolbarButton>
          <div className="mx-0.5 h-5 w-px bg-admin-line" />
          <ToolbarButton
            label="Bullet list"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Kode"
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code2 size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Highlight"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter size={15} />
          </ToolbarButton>
          <ToolbarButton label="Link" active={editor.isActive("link")} onClick={addLink}>
            <LinkIcon size={15} />
          </ToolbarButton>
          <ToolbarButton label="Gambar" onClick={addImage}>
            <ImageIcon size={15} />
          </ToolbarButton>
          <ToolbarButton label="Tabel" onClick={insertTable}>
            <Table2 size={15} />
          </ToolbarButton>
          <div className="mx-0.5 h-5 w-px bg-admin-line" />
          <ToolbarButton label="Card Grid" onClick={insertCardGrid}>
            <LayoutGrid size={15} />
          </ToolbarButton>
          <ToolbarButton label="Step List" onClick={insertStepList}>
            <Milestone size={15} />
          </ToolbarButton>
          <ToolbarButton label="Info Box" onClick={insertInfoBox}>
            <Info size={15} />
          </ToolbarButton>
          <ToolbarButton label="FAQ List" onClick={insertFaqList}>
            <HelpCircle size={15} />
          </ToolbarButton>
          <div className="mx-0.5 h-5 w-px bg-admin-line" />
          <ToolbarButton
            label="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo size={15} />
          </ToolbarButton>
          <ToolbarButton
            label="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo size={15} />
          </ToolbarButton>
          <div className="flex-1" />
          <ToolbarButton
            label={fullscreen ? "Kecilkan" : "Perbesar"}
            onClick={() => setFullscreen((v) => !v)}
          >
            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </ToolbarButton>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </>
  );
}
