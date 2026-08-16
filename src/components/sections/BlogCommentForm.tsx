"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDictionary } from "@/contexts/LocaleContext";
import { cn } from "@/lib/utils";
import { submitCommentAction } from "@/lib/actions/blog-comments";

type CommentFormValues = { nama: string; email: string; pesan: string };

const inputClass =
  "h-10 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

/* ─── Form komentar publik di bawah artikel — komentar masuk PENDING,
 * baru tampil setelah admin approve (lihat submitCommentAction). ─── */
export default function BlogCommentForm({ postId }: { postId: string }) {
  const dict = useDictionary();
  const commentSchema = useMemo(
    () =>
      z.object({
        nama: z.string().min(3, dict.blogComment.validation.nameMin),
        email: z.string().email(dict.blogComment.validation.emailInvalid),
        pesan: z.string().min(5, dict.blogComment.validation.commentMin),
      }),
    [dict],
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({ resolver: zodResolver(commentSchema) });

  const onSubmit = async (values: CommentFormValues) => {
    setSubmitError(null);
    const res = await submitCommentAction({
      postId,
      name: values.nama,
      email: values.email,
      content: values.pesan,
    });
    if (res.ok) {
      setSubmitted(true);
      reset();
    } else {
      setSubmitError(res.message);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl bg-primary/10 px-5 py-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-primary" aria-hidden="true" />
        <p className="mt-2.5 text-sm font-bold text-foreground">{dict.blogComment.successTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.blogComment.successCopy}
        </p>
        <Button variant="outline" className="mt-4 rounded-lg" onClick={() => setSubmitted(false)}>
          {dict.blogComment.sendAgain}
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="comment-nama" className="text-sm font-semibold text-foreground">
            {dict.blogComment.nameLabel} <span className="text-destructive">*</span>
          </label>
          <input
            id="comment-nama"
            type="text"
            placeholder={dict.blogComment.namePlaceholder}
            className={cn(inputClass, "mt-1.5")}
            aria-invalid={!!errors.nama}
            {...register("nama")}
          />
          {errors.nama && <p className="mt-1 text-xs text-destructive">{errors.nama.message}</p>}
        </div>
        <div>
          <label htmlFor="comment-email" className="text-sm font-semibold text-foreground">
            {dict.blogComment.emailLabel} <span className="text-destructive">*</span>
          </label>
          <input
            id="comment-email"
            type="email"
            placeholder={dict.blogComment.emailPlaceholder}
            className={cn(inputClass, "mt-1.5")}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="comment-pesan" className="text-sm font-semibold text-foreground">
          {dict.blogComment.commentLabel} <span className="text-destructive">*</span>
        </label>
        <textarea
          id="comment-pesan"
          rows={4}
          placeholder={dict.blogComment.commentPlaceholder}
          className={cn(inputClass, "mt-1.5 h-auto resize-y py-2.5")}
          aria-invalid={!!errors.pesan}
          {...register("pesan")}
        />
        {errors.pesan && <p className="mt-1 text-xs text-destructive">{errors.pesan.message}</p>}
      </div>

      {submitError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{submitError}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="gap-2 rounded-lg font-semibold"
      >
        {isSubmitting ? dict.blogComment.sending : dict.blogComment.send}
        <Send className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
