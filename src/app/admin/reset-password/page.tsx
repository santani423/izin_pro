import { Suspense } from "react";
import ResetPasswordFormClient from "./ResetPasswordFormClient";

/* ─── Halaman Reset Password ─── gak perlu cek sesi (justru biasanya
 * diakses TANPA login, lewat link dari email). Suspense wajib di sini
 * krn ResetPasswordFormClient pakai useSearchParams() buat baca token. */
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordFormClient />
    </Suspense>
  );
}
