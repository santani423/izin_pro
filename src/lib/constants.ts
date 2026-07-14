import type {
  NavItem,
  ServiceItem,
  TestimonialItem,
  VideoTestimonialItem,
  BlogPost,
  StatItem,
  PromoItem,
  ClientItem,
  FaqItem,
  TeamMember,
} from "@/types";

/* ─── Info Perusahaan ─── */
export const COMPANY_INFO = {
  name: "IzinPro",
  tagline: "Solusi Perizinan Bisnis Anda, Aman & Terpercaya",
  description:
    "Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional IzinPro. Lebih dari 5.000 klien telah mempercayakan urusan perizinan mereka kepada kami.",
  whatsapp: "6282280007821",
  whatsappDisplay: "0822-8000-7821",
  email: "izinpro.co.id@gmail.com",
  address: "Wisma Laena, Jl. KH Abdullah Syafei No.7 Lantai 7, Tebet, Jakarta Selatan 12860",
  addressShort: "Wisma Laena Lt.7, Tebet, Jakarta Selatan",
  hours: "Senin – Jumat, 08:00 – 17:00 WIB",
  mapsUrl:
    "https://maps.google.com/?q=Wisma+Laena+Jl+KH+Abdullah+Syafei+No+7+Jakarta+Selatan",
  foundedYear: 2018,
  social: {
    linkedin: "#",
    facebook: "#",
    instagram: "#",
    twitter: "#",
    youtube: "#",
  },
} as const;

/* ─── Navigasi Utama ─── */
export const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "/" },
  {
    label: "Layanan",
    href: "/layanan",
    children: [
      { label: "Pendirian PT", href: "/layanan/pendirian-pt" },
      { label: "NIB (Nomor Induk Berusaha)", href: "/layanan/nib" },
      { label: "Izin Usaha", href: "/layanan/izin-usaha" },
      { label: "Izin Komersial & Operasional", href: "/layanan/izin-komersial" },
      { label: "Perizinan Lainnya", href: "/layanan/perizinan-lainnya" },
    ],
  },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Panduan & Artikel", href: "/blog" },
  { label: "Kontak", href: "/kontak" },
];

/* ─── Layanan ─── */
export const SERVICES: ServiceItem[] = [
  {
    id: "1",
    slug: "pendirian-pt",
    title: "Pendirian PT",
    description:
      "Bantu pendirian PT secara cepat, mudah, dan legal sesuai regulasi terbaru pemerintah Indonesia.",
    icon: "building",
    color: "#5ba12b",
    bgColor: "#f3fae8",
    features: [
      "Akta Pendirian PT",
      "SK Kemenkumham",
      "NPWP Perusahaan",
      "Domisili Perusahaan",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "2",
    slug: "nib",
    title: "NIB (Nomor Induk Berusaha)",
    description:
      "Urus NIB secara mudah, cepat, dan resmi melalui sistem OSS terintegrasi pemerintah.",
    icon: "clipboard",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    features: [
      "Registrasi OSS",
      "Verifikasi Data Usaha",
      "Penerbitan NIB Resmi",
      "Update Status Real-time",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "3",
    slug: "izin-usaha",
    title: "Izin Usaha",
    description:
      "Berbagai izin usaha sesuai bidang bisnis Anda dengan proses transparan dan tanpa biaya tersembunyi.",
    icon: "file-text",
    color: "#f97316",
    bgColor: "#fff7ed",
    features: [
      "Analisis Jenis Izin",
      "Persiapan Dokumen",
      "Pengajuan ke Instansi",
      "Monitoring Proses",
      "Garansi Selesai",
    ],
  },
  {
    id: "4",
    slug: "izin-komersial",
    title: "Izin Komersial & Operasional",
    description:
      "Izin operasional untuk kelancaran kegiatan bisnis komersial Anda sesuai regulasi yang berlaku.",
    icon: "clock",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    features: [
      "Izin Edar",
      "Sertifikat Halal",
      "Izin BPOM",
      "Sertifikasi SNI",
      "Izin Operasional",
    ],
  },
  {
    id: "5",
    slug: "perizinan-lainnya",
    title: "Perizinan Lainnya",
    description:
      "Layanan perizinan komprehensif lainnya sesuai kebutuhan spesifik bisnis Anda di seluruh Indonesia.",
    icon: "list",
    color: "#ec4899",
    bgColor: "#fdf2f8",
    features: [
      "Perizinan Lokasi",
      "Sertifikasi Usaha",
      "Perubahan Data PT",
      "Penutupan Perusahaan",
      "Konsultasi Khusus",
    ],
  },
  {
    id: "6",
    slug: "pt-perorangan",
    title: "PT Perorangan",
    description:
      "Pendirian PT Perorangan untuk pelaku usaha mikro & kecil dengan proses lebih sederhana dan biaya terjangkau.",
    icon: "user-check",
    color: "#0891b2",
    bgColor: "#ecfeff",
    features: [
      "Akta PT Perorangan",
      "SK Kemenkumham",
      "NPWP Perusahaan",
      "NIB Otomatis",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "7",
    slug: "cv-firma",
    title: "CV & Firma",
    description:
      "Pendirian CV dan Firma sebagai badan usaha yang tepat untuk kemitraan dan usaha bersama.",
    icon: "briefcase",
    color: "#6366f1",
    bgColor: "#eef2ff",
    features: [
      "Akta CV / Firma",
      "Pendaftaran di PN",
      "NPWP Usaha",
      "NIB Terintegrasi",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "8",
    slug: "pma",
    title: "PMA",
    description:
      "Pendirian Penanaman Modal Asing (PMA) bagi investor asing yang ingin berusaha secara resmi di Indonesia.",
    icon: "globe",
    color: "#d97706",
    bgColor: "#fffbeb",
    features: [
      "Izin Prinsip BKPM",
      "Akta PMA",
      "LKPM (Laporan)",
      "Izin Lokasi & Usaha",
      "Konsultasi Investasi",
    ],
  },
  {
    id: "9",
    slug: "npwp-badan-pkp",
    title: "NPWP Badan & PKP",
    description:
      "Pengurusan NPWP Badan Usaha dan Pengukuhan Pengusaha Kena Pajak (PKP) untuk kebutuhan perpajakan bisnis.",
    icon: "receipt",
    color: "#e11d48",
    bgColor: "#fff1f2",
    features: [
      "NPWP Badan Usaha",
      "Pengukuhan PKP",
      "Konsultasi Pajak",
      "Pembuatan SPT",
      "Pendampingan DJP",
    ],
  },
  {
    id: "10",
    slug: "pendaftaran-merk",
    title: "Pendaftaran Merk",
    description:
      "Daftarkan merek dagang Anda di DJKI untuk perlindungan hukum yang kuat dan terhindar dari pemalsuan.",
    icon: "tag",
    color: "#0f766e",
    bgColor: "#f0fdfa",
    features: [
      "Konsultasi Kelas Merk",
      "Penelusuran Merk",
      "Pengajuan ke DJKI",
      "Monitoring Status",
      "Sertifikat Merk",
    ],
  },
  {
    id: "11",
    slug: "virtual-office",
    title: "Virtual Office",
    description:
      "Solusi alamat bisnis profesional tanpa sewa kantor fisik, lengkap dengan layanan surat menyurat dan meeting room.",
    icon: "monitor",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    features: [
      "Alamat Domisili Resmi",
      "Layanan Surat Menyurat",
      "Resepsionis Profesional",
      "Meeting Room",
      "Paket Fleksibel",
    ],
  },
  {
    id: "12",
    slug: "perizinan-lokasi",
    title: "Perizinan Lokasi",
    description:
      "Membantu pengurusan izin lokasi usaha dengan mudah dan cepat sesuai tata ruang wilayah.",
    icon: "map-pin",
    color: "#0284c7",
    bgColor: "#f0f9ff",
    features: [
      "Analisis Tata Ruang",
      "Izin Lokasi via OSS",
      "Persetujuan KKPR",
      "Koordinasi Instansi Daerah",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "13",
    slug: "sertifikasi",
    title: "Sertifikasi",
    description:
      "Pengurusan sertifikasi resmi untuk meningkatkan kepercayaan dan daya saing bisnis Anda.",
    icon: "badge-check",
    color: "#5ba12b",
    bgColor: "#f3fae8",
    features: [
      "Sertifikasi SNI",
      "Sertifikat Halal",
      "ISO & SMK3",
      "Sertifikat Laik Fungsi",
      "Pendampingan Audit",
    ],
  },
  {
    id: "14",
    slug: "perizinan-impor",
    title: "Perizinan Impor",
    description:
      "Layanan perizinan impor barang untuk mendukung kelancaran kegiatan bisnis Anda.",
    icon: "ship",
    color: "#0891b2",
    bgColor: "#ecfeff",
    features: [
      "Angka Pengenal Impor (API)",
      "NIB Kepabeanan",
      "Persetujuan Impor",
      "Registrasi Bea Cukai",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "15",
    slug: "izin-industri",
    title: "Izin Industri",
    description:
      "Membantu pengurusan izin usaha industri sesuai regulasi yang berlaku.",
    icon: "factory",
    color: "#d97706",
    bgColor: "#fffbeb",
    features: [
      "Izin Usaha Industri (IUI)",
      "Verifikasi Teknis",
      "Pendaftaran SIINas",
      "Laporan Kegiatan Industri",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "16",
    slug: "lingkungan-hidup",
    title: "Lingkungan Hidup",
    description:
      "Perizinan lingkungan untuk mendukung bisnis yang berkelanjutan dan taat regulasi.",
    icon: "leaf",
    color: "#0f766e",
    bgColor: "#f0fdfa",
    features: [
      "SPPL",
      "UKL-UPL",
      "AMDAL",
      "Persetujuan Lingkungan",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "17",
    slug: "perizinan-konstruksi",
    title: "Perizinan Konstruksi",
    description:
      "Pengurusan izin konstruksi untuk kelancaran proyek bangunan Anda.",
    icon: "hard-hat",
    color: "#ea580c",
    bgColor: "#fff7ed",
    features: [
      "PBG (Pengganti IMB)",
      "SLF (Sertifikat Laik Fungsi)",
      "SBU Konstruksi",
      "IUJK",
      "Konsultasi Gratis",
    ],
  },
  {
    id: "18",
    slug: "perubahan-pembaruan-izin",
    title: "Perubahan & Pembaruan Izin",
    description:
      "Layanan perubahan atau pembaruan data izin usaha Anda agar legalitas tetap valid.",
    icon: "refresh",
    color: "#7c3aed",
    bgColor: "#f5f3ff",
    features: [
      "Perubahan Akta Perusahaan",
      "Update Data OSS",
      "Perpanjangan Izin",
      "Perubahan KBLI",
      "Konsultasi Gratis",
    ],
  },
];

/* ─── Testimoni ─── */
export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "1",
    name: "Andi Setiawan",
    role: "Direktur",
    company: "PT Maju Bersama",
    content:
      "Prosesnya cepat dan mudah, tim IzinPro sangat membantu hingga izin usaha kami selesai. Sangat direkomendasikan untuk pengusaha yang ingin legalitas cepat!",
    rating: 5,
    initials: "AS",
    avatarColor: "from-[#5ba12b] to-[#72ba38]",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    role: "Owner",
    company: "CV Kreatif Mandiri",
    content:
      "Pelayanan profesional dan hasil memuaskan. Proses pengurusan NIB yang tadinya saya pikir rumit, ternyata selesai dalam 2 hari. Terima kasih IzinPro!",
    rating: 5,
    initials: "SN",
    avatarColor: "from-[#0284c7] to-[#38bdf8]",
  },
  {
    id: "3",
    name: "Budi Santoso",
    role: "CEO",
    company: "PT Solusi Digital",
    content:
      "Harga terjangkau, proses sangat transparan dan tidak ada biaya tersembunyi. IzinPro benar-benar solusi terbaik untuk perizinan bisnis di Indonesia.",
    rating: 5,
    initials: "BS",
    avatarColor: "from-[#7c3aed] to-[#a78bfa]",
  },
  {
    id: "4",
    name: "Rina Wijaya",
    role: "Owner",
    company: "CV Sejahtera Abadi",
    content:
      "Izin usaha kami selesai tepat waktu. Tim IzinPro selalu responsif dan memberikan update perkembangan secara real-time. Sangat puas dengan pelayanannya!",
    rating: 5,
    initials: "RW",
    avatarColor: "from-[#be185d] to-[#f472b6]",
  },
  {
    id: "5",
    name: "Deni Hermawan",
    role: "Founder",
    company: "PT Karya Nusantara",
    content:
      "Sangat membantu bisnis kami berkembang dengan legalitas yang terjamin. Prosesnya mudah dipahami dan tim selalu siap membantu kapanpun dibutuhkan.",
    rating: 5,
    initials: "DH",
    avatarColor: "from-[#b45309] to-[#fbbf24]",
  },
  {
    id: "6",
    name: "Laila Mahmud",
    role: "Direktur",
    company: "CV Prima Utama",
    content:
      "Layanan yang sangat profesional. Dokumen lengkap dan tertata rapi. Saya sudah 3 kali menggunakan jasa IzinPro dan tidak pernah kecewa.",
    rating: 5,
    initials: "LM",
    avatarColor: "from-[#0f766e] to-[#34d399]",
  },
];

/* ─── Video Testimoni ─── */
export const VIDEO_TESTIMONIALS: VideoTestimonialItem[] = [
  {
    id: "1",
    name: "Andi Setiawan",
    role: "Direktur, PT Maju Bersama",
    duration: "01:24",
    gradient: "from-[#2e5511] to-[#72ba38]",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    role: "Owner, CV Kreatif Mandiri",
    duration: "01:37",
    gradient: "from-[#0c4a6e] to-[#38bdf8]",
  },
  {
    id: "3",
    name: "Budi Santoso",
    role: "CEO, PT Solusi Digital",
    duration: "01:19",
    gradient: "from-[#4a1d96] to-[#a78bfa]",
  },
  {
    id: "4",
    name: "Rina Wijaya",
    role: "Owner, CV Sejahtera Abadi",
    duration: "01:18",
    gradient: "from-[#7f1d1d] to-[#f87171]",
  },
  {
    id: "5",
    name: "Fajar Nugroho",
    role: "CEO, PT Karya Abadi",
    duration: "01:32",
    gradient: "from-[#713f12] to-[#fbbf24]",
  },
];

/* ─── Artikel Blog ─── */
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    slug: "cara-mudah-membuat-nib-online-2024",
    title: "Cara Mudah Membuat NIB Online 2025 — Panduan Lengkap",
    excerpt:
      "Nomor Induk Berusaha (NIB) adalah identitas resmi bagi pelaku usaha di Indonesia. Simak panduan lengkap cara membuatnya secara online melalui sistem OSS.",
    category: "Perizinan",
    date: "24 Januari 2025",
    views: "1.284",
    gradient: "from-[#1b3309] to-[#5ba12b]",
  },
  {
    id: "2",
    slug: "tips-memilih-badan-usaha",
    title: "5 Tips Memilih Badan Usaha yang Tepat untuk Bisnis Anda",
    excerpt:
      "Pemilihan badan usaha sangat mempengaruhi legalitas, pajak, dan pertumbuhan bisnis. Pelajari perbedaan CV, PT, dan koperasi beserta keuntungannya.",
    category: "Tips Bisnis",
    date: "20 Januari 2025",
    views: "856",
    gradient: "from-[#1e3a5f] to-[#3b82f6]",
  },
  {
    id: "3",
    slug: "update-peraturan-perizinan-2025",
    title: "Update Terbaru Peraturan Perizinan Usaha 2025 yang Wajib Diketahui",
    excerpt:
      "Pemerintah merilis sejumlah pembaruan regulasi perizinan usaha. Pastikan bisnis Anda tetap compliant dengan peraturan terkini agar operasional berjalan lancar.",
    category: "Peraturan",
    date: "18 Januari 2025",
    views: "2.147",
    gradient: "from-[#7c2d12] to-[#ea580c]",
  },
  {
    id: "4",
    slug: "apa-itu-oss-penjelasan-lengkap",
    title: "Apa itu OSS? Penjelasan Lengkap Sistem Perizinan Terintegrasi",
    excerpt:
      "Online Single Submission (OSS) adalah sistem perizinan terintegrasi di Indonesia. Pelajari cara kerjanya dan manfaatnya bagi pengusaha di seluruh Indonesia.",
    category: "Perizinan",
    date: "15 Januari 2025",
    views: "743",
    gradient: "from-[#4a1d96] to-[#8b5cf6]",
  },
  {
    id: "5",
    slug: "keuntungan-mendirikan-pt-vs-cv",
    title: "Keuntungan Mendirikan PT vs CV: Mana yang Lebih Menguntungkan?",
    excerpt:
      "Banyak pengusaha bingung antara mendirikan PT atau CV. Artikel ini membahas keunggulan dan kelemahan masing-masing bentuk badan usaha secara komprehensif.",
    category: "Tips Bisnis",
    date: "10 Januari 2025",
    views: "1.521",
    gradient: "from-[#0f3460] to-[#0891b2]",
  },
  {
    id: "6",
    slug: "panduan-lengkap-sertifikasi-halal",
    title: "Panduan Lengkap Mendapatkan Sertifikasi Halal untuk Produk Anda",
    excerpt:
      "Sertifikasi Halal semakin penting bagi pelaku usaha di Indonesia. Pelajari syarat, prosedur, dan tips agar proses sertifikasi berjalan lancar dan efisien.",
    category: "Sertifikasi",
    date: "5 Januari 2025",
    views: "921",
    gradient: "from-[#064e3b] to-[#10b981]",
  },
  {
    id: "7",
    slug: "panduan-lengkap-mengurus-nib-melalui-oss",
    title: "Panduan Lengkap Mengurus NIB Melalui OSS",
    excerpt:
      "Dapatkan NIB (Nomor Induk Berusaha) dengan mudah, cepat, dan legal melalui sistem OSS. Ikuti panduan lengkap berikut agar proses pengajuan NIB Anda lancar tanpa kendala.",
    category: "Panduan Lengkap",
    date: "24 Mei 2024",
    views: "1.048",
    gradient: "from-[#1b3309] to-[#5ba12b]",
  },
  {
    id: "8",
    slug: "legalitas-lengkap-bisnis-makin-terpercaya",
    title: "Legalitas Lengkap, Bisnis Makin Terpercaya",
    excerpt:
      "Miliki semua legalitas usaha yang dibutuhkan untuk menjalankan bisnis secara aman, profesional, dan dipercaya oleh klien maupun mitra.",
    category: "Panduan Lengkap",
    date: "10 Mei 2024",
    views: "864",
    gradient: "from-[#14532d] to-[#22c55e]",
  },
];

/* ─── Statistik ─── */
export const STATS: StatItem[] = [
  {
    value: 5000,
    suffix: "+",
    label: "Perizinan Berhasil Diselesaikan",
    icon: "file-check",
    color: "#5ba12b",
    bgColor: "#f3fae8",
  },
  {
    value: 99,
    suffix: "%",
    label: "Tingkat Kepuasan Klien",
    icon: "shield-check",
    color: "#f97316",
    bgColor: "#fff7ed",
  },
  {
    value: 10,
    suffix: "+",
    label: "Tahun Pengalaman di Bidangnya",
    icon: "clock",
    color: "#3b82f6",
    bgColor: "#eff6ff",
  },
  {
    value: 50,
    suffix: "+",
    label: "Tenaga Ahli Profesional Berpengalaman",
    icon: "users",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
  },
];

/* ─── Promo ─── */
export const PROMOS: PromoItem[] = [
  {
    id: "1",
    tag: "🔥 Terbatas",
    title: "DISKON",
    subtitle: "25%",
    description: "Untuk layanan Pendirian PT. Berlaku hingga akhir bulan ini. Segera manfaatkan!",
    ctaLabel: "Klaim Sekarang",
    ctaHref: `https://wa.me/6282280007821?text=Halo%2C%20saya%20ingin%20klaim%20promo%20diskon%2025%25%20untuk%20Pendirian%20PT`,
    gradient: "from-[#43791b] to-[#5ba12b]",
  },
  {
    id: "2",
    tag: "✨ Gratis",
    title: "GRATIS",
    subtitle: "Konsultasi",
    description: "Konsultasi gratis untuk semua layanan perizinan tanpa syarat, kapan saja.",
    ctaLabel: "Konsultasi Sekarang",
    ctaHref: `https://wa.me/6282280007821?text=Halo%2C%20saya%20ingin%20konsultasi%20gratis`,
    gradient: "from-[#0369a1] to-[#3b82f6]",
  },
  {
    id: "3",
    tag: "💼 Hemat",
    title: "PAKET",
    subtitle: "Hemat",
    description: "Perizinan lengkap mulai dari Rp 3.500.000. All-in, tanpa biaya tambahan.",
    ctaLabel: "Lihat Paket",
    ctaHref: "/layanan",
    gradient: "from-[#7c3aed] to-[#8b5cf6]",
  },
];

/* ─── Klien / Partner ─── */
export const CLIENTS: ClientItem[] = [
  { name: "Bank BJB", color: "#1e40af" },
  { name: "Alfamart", color: "#ef4444" },
  { name: "Telkom Indonesia", color: "#dc2626" },
  { name: "Trias Investama", color: "#0369a1" },
  { name: "JNE", color: "#ea580c" },
  { name: "Sinarmas", color: "#5ba12b" },
  { name: "WIKA", color: "#0891b2" },
  { name: "Maybank", color: "#7c3aed" },
  { name: "Bank Mandiri", color: "#b45309" },
  { name: "BRI", color: "#0f766e" },
];

/* ─── FAQ ─── */
export const FAQS: FaqItem[] = [
  {
    question: "Berapa lama proses pengurusan perizinan di IzinPro?",
    answer:
      "Rata-rata proses berlangsung 3–7 hari kerja tergantung jenis perizinan dan kelengkapan dokumen. Kami selalu memberikan estimasi waktu yang akurat di awal konsultasi.",
  },
  {
    question: "Apakah ada biaya tersembunyi dalam layanan IzinPro?",
    answer:
      "Tidak ada. IzinPro menerapkan prinsip transparansi penuh. Semua biaya disampaikan di awal sebelum Anda memutuskan untuk menggunakan layanan kami.",
  },
  {
    question: "Dokumen apa saja yang perlu disiapkan untuk pendirian PT?",
    answer:
      "Dokumen dasar yang diperlukan antara lain: KTP dan NPWP para pendiri, alamat domisili perusahaan, modal dasar yang ditetapkan, dan bidang usaha yang akan dijalankan. Tim kami akan memandu Anda secara detail.",
  },
  {
    question: "Apakah IzinPro bisa membantu perizinan di luar kota Jakarta?",
    answer:
      "Ya, IzinPro melayani klien dari seluruh Indonesia. Dengan sistem digital yang kami miliki, proses pengurusan dapat dilakukan tanpa harus hadir secara fisik ke kantor kami.",
  },
  {
    question: "Bagaimana cara memulai konsultasi dengan IzinPro?",
    answer:
      "Sangat mudah! Hubungi kami via WhatsApp di nomor 0822-8000-7821 atau isi form kontak di website ini. Tim kami akan merespons dalam waktu maksimal 1×24 jam.",
  },
  {
    question: "Apakah ada garansi jika perizinan tidak disetujui?",
    answer:
      "IzinPro memberikan garansi proses: jika perizinan tidak disetujui karena kesalahan dari pihak kami, kami akan menanggung biaya pengajuan ulang tanpa biaya tambahan untuk klien.",
  },
];

/* ─── Tim ─── */
export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Bambang Prasetyo",
    role: "CEO & Founder",
    initials: "BP",
    gradient: "from-[#43791b] to-[#5ba12b]",
  },
  {
    name: "Dewi Kartika",
    role: "Head of Legal",
    initials: "DK",
    gradient: "from-[#0369a1] to-[#3b82f6]",
  },
  {
    name: "Rizky Pratama",
    role: "Senior Perizinan Consultant",
    initials: "RP",
    gradient: "from-[#7c3aed] to-[#a78bfa]",
  },
  {
    name: "Fitria Handayani",
    role: "Operations Manager",
    initials: "FH",
    gradient: "from-[#b45309] to-[#fbbf24]",
  },
  {
    name: "Agus Santoso",
    role: "Business Development",
    initials: "AG",
    gradient: "from-[#be185d] to-[#f472b6]",
  },
  {
    name: "Nurul Hidayah",
    role: "Customer Relations",
    initials: "NH",
    gradient: "from-[#0f766e] to-[#34d399]",
  },
];

/* ─── Navigasi Footer ─── */
export const FOOTER_LINKS = {
  layanan: [
    { label: "Pendirian Perusahaan", href: "/layanan/pendirian-pt" },
    { label: "Perizinan Usaha", href: "/layanan/izin-usaha" },
    { label: "Perizinan Lokasi", href: "/layanan" },
    { label: "Sertifikasi", href: "/layanan/izin-komersial" },
    { label: "Perizinan Lainnya", href: "/layanan/perizinan-lainnya" },
  ],
  informasi: [
    { label: "Tentang Kami", href: "/tentang-kami" },
    { label: "Panduan & Artikel", href: "/blog" },
    { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
    { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
    { label: "Hubungi Kami", href: "/kontak" },
  ],
  bantuan: [
    { label: "FAQ", href: "/faq" },
    { label: "Karir", href: "/karir" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
};
