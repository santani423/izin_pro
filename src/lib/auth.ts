import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";

/* Invite-only (v1.5.4): tidak ada self sign-up publik — user dibuat manual
 * oleh Super Admin/Admin lewat menu Pengguna. emailAndPassword tetap aktif
 * krn dipakai utk LOGIN, bukan pendaftaran publik. */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "mysql" }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6, // samakan dgn aturan di form admin/users ("Password minimal 6 karakter")
    resetPasswordTokenExpiresIn: 60 * 60, // link reset berlaku 1 jam
    sendResetPassword: async ({ user, url }) => {
      await sendMail({
        to: user.email,
        subject: "Reset Password Admin IzinPro",
        text: `Halo ${user.name},\n\nAda permintaan reset password untuk akun admin IzinPro kamu. Klik link berikut buat bikin password baru (berlaku 1 jam):\n${url}\n\nKalau kamu gak merasa minta ini, abaikan aja email ini — password kamu tetap aman.`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #1b3309;">Reset Password Admin IzinPro</h2>
            <p>Halo ${user.name},</p>
            <p>Ada permintaan reset password untuk akun admin IzinPro kamu. Klik tombol di bawah buat bikin password baru (link berlaku 1 jam):</p>
            <p style="margin: 24px 0;">
              <a href="${url}" style="background:#5ba12b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reset Password</a>
            </p>
            <p style="color:#888;font-size:13px;">Kalau kamu gak merasa minta ini, abaikan aja email ini — password kamu tetap aman.</p>
          </div>
        `,
      });
    },
  },
  /* Sesi admin auto-logout kalau idle 1 jam. updateAge jauh lebih pendek
   * dari expiresIn supaya efeknya jadi idle-timeout (bukan hard deadline
   * dari waktu login) — tiap request admin yang lolos >5 menit dari update
   * terakhir bakal geser expiresAt jadi +1 jam lagi dari saat itu. */
  session: {
    expiresIn: 60 * 60, // 1 jam
    updateAge: 60 * 5, // perpanjang tiap 5 menit sekali kalau masih aktif dipakai
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "EDITOR", input: false },
      isActive: { type: "boolean", required: false, defaultValue: true, input: false },
    },
  },
  hooks: {
    // Blokir login kalau akunnya dinonaktifkan (Switch "Aktif/Nonaktif" di admin/users)
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-in/email") return;
      const email = ctx.body?.email as string | undefined;
      if (!email) return;
      const user = await prisma.user.findUnique({ where: { email } });
      if (user && !user.isActive) {
        throw new APIError("FORBIDDEN", {
          message: "Akun ini telah dinonaktifkan. Hubungi Super Admin.",
        });
      }
    }),
  },
});
