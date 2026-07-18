import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/db";

async function main() {
  const email = "admin@izinpro.co.id";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Super Admin sudah ada: ${email}`);
    return;
  }

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password: "admin123",
      name: "Super Admin",
    },
  });

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "SUPER_ADMIN" },
  });

  console.log(`Super Admin dibuat: ${email} / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
