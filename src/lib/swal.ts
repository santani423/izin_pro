/* ─── Store popup CRUD admin panel ───
 * Dulu pembungkus SweetAlert2, sekarang state store polos (module-level
 * pub/sub, gak butuh Zustand/dsb) yang dirender AlertHost.tsx pakai
 * komponen Dialog sendiri (Base UI + Tailwind) — biar konsisten visual
 * sama desain admin, gak perlu dependency ekstra. Semua 16 file admin yang
 * pakai swalSuccess/swalError/swalConfirmDelete gak perlu diubah sama
 * sekali, tinggal ganti isi file ini. */

type SwalState =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: "confirm"; message: string };

const IDLE_STATE: SwalState = { type: "idle" };

let state: SwalState = IDLE_STATE;
let pendingResolve: ((confirmed: boolean) => void) | null = null;
const listeners = new Set<() => void>();

function setState(next: SwalState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribeSwal(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSwalState() {
  return state;
}

export function getSwalServerSnapshot(): SwalState {
  return IDLE_STATE;
}

export function swalSuccess(message: string) {
  setState({ type: "success", message });
}

export function swalError(message: string) {
  setState({ type: "error", message });
}

export function swalConfirmDelete(itemLabel: string): Promise<boolean> {
  return new Promise((resolve) => {
    pendingResolve = resolve;
    setState({ type: "confirm", message: `${itemLabel} akan dihapus.` });
  });
}

/** Dipanggil AlertHost.tsx — nutup popup manapun yang lagi kebuka.
 * `confirmed` cuma relevan buat state "confirm". */
export function closeSwal(confirmed = false) {
  if (pendingResolve) {
    pendingResolve(confirmed);
    pendingResolve = null;
  }
  setState({ type: "idle" });
}
