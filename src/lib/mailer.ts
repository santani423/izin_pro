import nodemailer from "nodemailer";

/* SMTP transporter — kredensial dari SMTP milik user sendiri (bukan
 * provider pihak ketiga), diisi di .env (lihat .env.example). Dibuat
 * sekali & dipakai ulang (nodemailer transporter aman dipanggil berkali-
 * kali secara bersamaan). */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === "true", // true = SSL langsung (port 465), false = STARTTLS (port 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
