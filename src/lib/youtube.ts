/* Parser URL YouTube (dipakai section "Tentang IzinPro" di beranda) — admin
 * boleh tempel link apa pun bentuknya (watch, youtu.be, shorts, embed),
 * disimpan apa adanya di DB, lalu dikonversi ke embed URL di sini saat mau
 * dirender via <iframe>. Return null kalau bukan link YouTube yang valid. */

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{10,12}$/;

export function extractYoutubeEmbedUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\.|^music\./, "");
  let videoId: string | null = null;

  if (host === "youtu.be") {
    videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
  } else if (host === "youtube.com") {
    if (url.pathname === "/watch") {
      videoId = url.searchParams.get("v");
    } else {
      const match = url.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
      videoId = match?.[2] ?? null;
    }
  }

  if (!videoId || !YOUTUBE_ID_RE.test(videoId)) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export function isValidYoutubeUrl(input: string): boolean {
  return extractYoutubeEmbedUrl(input) !== null;
}

/* Thumbnail bawaan YouTube dari video ID — hqdefault selalu tersedia utk
 * video publik (beda dgn maxresdefault yg kadang 404 kalau uploader gak
 * pasang thumbnail resolusi tinggi). Dipakai VideoDialog biar preview
 * sebelum diklik nampilin gambar video, bukan cuma gradient polos. */
export function getYoutubeThumbnailUrl(embedUrl: string): string {
  const videoId = embedUrl.split("/").filter(Boolean).pop() ?? "";
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
