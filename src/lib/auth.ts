import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { prisma } from "@/lib/db";

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
