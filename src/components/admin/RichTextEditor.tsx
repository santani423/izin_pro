"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  ImageIcon,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadBlogContentImageAction } from "@/lib/actions/blog";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

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
export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
      Image,
      Placeholder.configure({ placeholder: "Tulis isi artikel di sini..." }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[240px] px-3.5 py-3 focus:outline-none [&_p]:my-2 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:mt-3 [&_h3]:mb-1.5",
      },
    },
  });

  if (!editor) return null;

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

  return (
    <div className="mt-1.5 overflow-hidden rounded-lg border border-border/60">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-admin-line bg-gray-50/50 px-1.5 py-1">
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
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 size={15} />
        </ToolbarButton>
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
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={addLink}>
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton label="Gambar" onClick={addImage}>
          <ImageIcon size={15} />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-admin-line" />
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
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
