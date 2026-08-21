/* Base URL deployment ini — dipakai buat metadataBase, canonical, & og:url.
 * Reuse BETTER_AUTH_URL (bukan env var baru) krn itu udah wajib diisi persis
 * sama dgn domain yang beneran serve app (better-auth validasi callback URL
 * ketat), jadi selalu benar per environment (localhost/dev1.../produksi)
 * tanpa perlu env var terpisah yang gampang lupa disinkron. */
export const SITE_URL = process.env.BETTER_AUTH_URL || "https://izinpro.co.id";
