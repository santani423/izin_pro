"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { Comment } from "@prisma/client";

import BlogCommentForm from "@/components/sections/BlogCommentForm";
import { useDictionary, useLocale } from "@/contexts/LocaleContext";
import { format } from "@/i18n/format";

const INTL_LOCALES: Record<string, string> = { id: "id-ID", en: "en-US", zh: "zh-CN" };

function formatCommentDate(date: Date, intlLocale: string) {
  return date.toLocaleDateString(intlLocale, { day: "numeric", month: "long", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── Komentar + form komentar baru — di bawah badan artikel /blog/[slug].
 * Client Component (bukan Server Component lagi) krn komentar baru
 * ditambahkan ke state lokal begitu submitCommentAction sukses (langsung
 * APPROVED) — biar langsung tampil tanpa nunggu reload/revalidate
 * (lihat BlogCommentForm.tsx & submitCommentAction). ─── */
export default function BlogCommentsSection({
  postId,
  comments: initialComments,
}: {
  postId: string;
  comments: Comment[];
}) {
  const locale = useLocale();
  const dict = useDictionary();
  const intlLocale = INTL_LOCALES[locale];
  const [comments, setComments] = useState(initialComments);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
          <MessageCircle className="size-5 text-primary" aria-hidden="true" />
          {format(dict.blogComments.headingTemplate, { count: comments.length })}
        </h2>

        {comments.length > 0 && (
          <ul className="mt-6 space-y-5">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-lime to-brand-green-dark text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  {getInitials(comment.name)}
                </span>
                <div className="min-w-0 flex-1 rounded-xl bg-muted/40 px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <p className="text-sm font-semibold text-foreground">{comment.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCommentDate(comment.createdAt, intlLocale)}</p>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{comment.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 rounded-2xl border border-border/60 p-5 sm:p-6">
          <h3 className="text-sm font-bold text-foreground">{dict.blogComments.leaveCommentHeading}</h3>
          <div className="mt-4">
            <BlogCommentForm
              postId={postId}
              onSubmitted={(comment) => setComments((prev) => [comment, ...prev])}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
