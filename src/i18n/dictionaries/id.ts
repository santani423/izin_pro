/* ─── Dictionary Bahasa Indonesia (sumber kebenaran bentuk/shape) ───
 * en.ts & zh.ts dideklarasikan dengan tipe `Dictionary` (= typeof id di
 * bawah) supaya TypeScript maksa parity: kalau ada key baru ditambah di
 * sini tapi lupa diisi di en/zh, build bakal error duluan.
 *
 * Cakupan: teks UI statis (navbar, footer, tombol, heading section, label
 * form, dst) di seluruh halaman publik. Konten dari database (Hero admin,
 * daftar Layanan, Testimoni, Blog, FAQ Kontak/Layanan) SENGAJA tidak masuk
 * sini — itu tetap tampil apa adanya dari admin di semua bahasa. Beberapa
 * larik statis yang murni dekoratif & tidak bisa diedit admin (mis. katalog
 * /layanan, panduan legalitas, FAQ homepage) juga sengaja dibiarkan di luar
 * scope ini untuk saat ini.
 */
const id = {
  common: {
    breadcrumbHome: "Beranda",
    ariaBreadcrumb: "Breadcrumb",
    officeHours: "Senin – Jumat, 08:00 – 17:00 WIB",
  },

  navbar: {
    ariaMainNav: "Navigasi utama",
    ariaOpenMenu: "Buka menu navigasi",
    ariaMobileNav: "Navigasi mobile",
    trackingButton: "Tracking Perizinan",
    menuSheetTitle: "Menu",
    logoAlt: "IzinPro",
  },

  localeSwitcher: {
    ariaLabel: "Pilih bahasa",
  },

  footer: {
    logoAlt: "IzinPro",
    brandBlurb:
      "Solusi perizinan terpercaya untuk mendukung legalitas dan pertumbuhan bisnis Anda.",
    contactHeading: "Hubungi Kami",
    copyright: "© {year} {company}. All Rights Reserved.",
  },

  whatsappFab: {
    ariaLabel: "Mulai konsultasi gratis via WhatsApp",
    hoverText: "Mulai Konsultasi Gratis",
  },

  backToTop: {
    ariaLabel: "Kembali ke atas",
  },

  maintenance: {
    imageAlt: "Website sedang dalam pemeliharaan",
    heading: "Sedang Dalam Pemeliharaan",
    button: "Hubungi Kami via WhatsApp",
    rightsReserved: "All rights reserved.",
  },

  hero: {
    ariaRating: "Rating 5 dari 5 bintang",
    placeholderTagline: "Platform Perizinan Bisnis #1 Indonesia",
    placeholderTags: ["OSS Terintegrasi", "Bergaransi", "Transparan"],
    stats: [
      { value: "5.000+", label: "Perizinan Selesai" },
      { value: "99%", label: "Kepuasan Klien" },
    ],
  },

  services: {
    heading: "Daftar Layanan",
    subtitle: "Layanan legal dengan proses mudah, cepat dan sesuai regulasi.",
    linkLabel: "Lihat Semua Layanan",
    cardLink: "Selengkapnya",
    ariaIllustrationTemplate: "Ilustrasi layanan {title}",
  },

  promo: {
    heading: "Promo Spesial",
    subtitle: "Dapatkan penawaran terbaik untuk layanan perizinan pilihan Anda.",
    items: [
      {
        eyebrow: "DISKON",
        title: "25%",
        description: "Untuk Pendirian PT selama bulan ini",
        ctaLabel: "Klaim Sekarang",
      },
      {
        eyebrow: "GRATIS",
        title: "Konsultasi",
        description: "untuk semua layanan",
        ctaLabel: "Konsultasi Sekarang",
      },
      {
        eyebrow: "PAKET HEMAT",
        title: "Perizinan Lengkap",
        description: "Mulai dari Rp 5.200.000",
        ctaLabel: "Lihat Paket",
      },
    ],
  },

  about: {
    heading: "Tentang IzinPro",
    description:
      "IzinPro adalah penyedia jasa layanan perizinan bisnis terpercaya yang berkomitmen memberikan layanan terbaik dengan proses cepat, transparan, dan aman.",
    points: [
      "Legal & Resmi",
      "Proses Cepat & Efisien",
      "Konsultasi Gratis & Transparan",
      "Layanan Terlengkap & Terpercaya",
    ],
    button: "Selengkapnya Tentang Kami",
    videoTitle: "Video profil IzinPro",
  },

  articles: {
    heading: "Artikel Terbaru",
    subtitle: "Informasi terbaru seputar perizinan usaha dan regulasi bisnis.",
    linkLabel: "Lihat Semua Artikel",
    ariaThumbnailTemplate: "Thumbnail artikel: {title}",
    viewsSuffix: "views",
    readMore: "Baca selengkapnya",
  },

  trackHome: {
    headingPrefix: "Lacak",
    headingHighlight: "Layanan Anda",
    subtitle:
      "Sudah menggunakan layanan kami? Masukkan kode transaksi Anda untuk memantau progresnya secara real-time.",
    placeholder: "Kode Transaksi (mis. TRX-20260731-000001)",
    ariaInput: "Kode transaksi",
    button: "Lacak Layanan",
  },

  location: {
    eyebrow: "Lokasi & Kontak",
    heading: "Temukan Kami di Sini",
    subtitle: "Kunjungi kantor kami atau hubungi tim profesional IzinPro kapan saja.",
    officeAddress: "Alamat Kantor",
    phoneWhatsapp: "Telepon / WhatsApp",
    email: "Email",
    operatingHours: "Jam Operasional",
    mapTitle: "Peta lokasi kantor IzinPro",
    openInMaps: "Buka di Google Maps",
  },

  testimonials: {
    heading: "Testimoni Klien",
    subtitle: "Kepercayaan dan kepuasan klien adalah prioritas kami.",
    ariaRatingTemplate: "Rating {rating} dari 5 bintang",
    ariaPrev: "Testimoni sebelumnya",
    ariaNext: "Testimoni berikutnya",
    ariaPaginationNav: "Navigasi halaman testimoni",
    ariaPageTemplate: "Halaman testimoni {page}",
  },

  videoTestimonials: {
    heading: "Video Testimoni Klien",
    subtitle: "Simak pengalaman langsung dari klien yang telah menggunakan layanan IzinPro.",
    ariaPlayTemplate: "Putar video: {title}",
    ariaClose: "Tutup video",
  },

  clients: {
    heading: "Klien Kami",
  },

  faq: {
    heading: "Pertanyaan yang Sering Diajukan",
    subtitle: "Temukan jawaban atas pertanyaan umum tentang layanan IzinPro.",
    items: [
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
    ],
  },

  cta: {
    defaultTitle: "Siap Memulai Perizinan Bisnis Anda?",
    defaultSubtitle: "Konsultasikan kebutuhan perizinan Anda sekarang gratis bersama tim ahli kami.",
    defaultButton: "Konsultasikan Gratis Sekarang",
  },

  pages: {
    home: {
      metaTitle: "IzinPro — Solusi Perizinan Bisnis Terpercaya di Indonesia",
      metaDescription:
        "Urus perizinan usaha dengan mudah, cepat, dan legal bersama tim profesional IzinPro. Pendirian PT, NIB, Izin Usaha, dan lebih banyak layanan perizinan.",
    },
    blog: {
      metaTitle: "Blog dan Artikel Seputar Perizinan Usaha",
      metaDescription:
        "Informasi terbaru seputar perizinan usaha, regulasi, dan tips untuk mendukung pertumbuhan bisnis Anda — dari tim IzinPro.",
      breadcrumbArtikel: "Artikel",
      imageLabel: "Ilustrasi laptop menampilkan artikel IzinPro",
      ctaTitle: "Butuh Bantuan Perizinan untuk Bisnis Anda?",
      ctaSubtitle: "Konsultasikan kebutuhan perizinan Anda sekarang juga secara gratis bersama tim ahli kami.",
    },
    blogDetail: {
      notFoundTitle: "Artikel Tidak Ditemukan",
      breadcrumbArtikel: "Artikel",
      imageLabelTemplate: "Ilustrasi artikel {title}",
      avatarInitials: "IP",
      authorLine: "Ditulis oleh Tim IzinPro",
      updatedPrefix: "Diperbarui: ",
      ctaTitle: "Ingin Proses Lebih Cepat & Tanpa Ribet?",
      ctaSubtitle:
        "Serahkan pengurusan perizinan Anda kepada tim profesional kami. Lebih hemat waktu, aman, dan pasti selesai.",
    },
    kontak: {
      metaTitle: "Hubungi IzinPro — Konsultasi Perizinan Gratis",
      metaDescription:
        "Hubungi IzinPro melalui form, WhatsApp, email, atau datang langsung ke kantor kami di Tebet, Jakarta Selatan. Konsultasi perizinan gratis.",
      breadcrumbKontak: "Kontak",
      imageLabel: "Foto customer service IzinPro siap membantu",
    },
    layanan: {
      metaTitle: "Daftar Layanan Perizinan Bisnis",
      metaDescription:
        "Berbagai layanan perizinan untuk mendukung legalitas dan kelancaran bisnis Anda — Pendirian PT, NIB, Izin Usaha, Sertifikasi, hingga Perizinan Impor. Cepat, legal, dan transparan.",
    },
    layananDetail: {
      notFoundTitle: "Layanan Tidak Ditemukan",
    },
    promo: {
      metaTitle: "Promosi Spesial Layanan Perizinan",
      metaDescription:
        "Penawaran terbaik IzinPro — paket promo Pendirian PT, Izin Usaha, dan Perizinan Lengkap dengan harga hemat, proses cepat, dan 100% legal.",
      breadcrumbPromo: "Promo",
      imageLabel: "Ilustrasi kado promo spesial IzinPro",
      highlightsAriaLabel: "Keunggulan promo IzinPro",
    },
    tentangKami: {
      notFoundTitle: "Tentang Kami",
      breadcrumbTentangKami: "Tentang Kami",
      imageLabel: "Foto kantor resepsionis IzinPro",
    },
    testimoni: {
      metaTitle: "Testimoni Klien IzinPro",
      metaDescription:
        "Kepercayaan dan kepuasan klien adalah prioritas kami. Simak pengalaman nyata klien yang telah menggunakan layanan perizinan IzinPro.",
      breadcrumbTestimoni: "Testimoni",
      imageLabel: "Foto klien IzinPro yang puas dengan layanan",
    },
    tracking: {
      metaTitle: "Tracking Perizinan — Lacak Status Order Anda",
      metaDescription:
        "Pantau status pengurusan perizinan Anda di IzinPro secara real-time. Masukkan nomor order untuk melihat proses perizinan sudah sampai tahap mana.",
      breadcrumbTracking: "Tracking",
      headingPrefix: "Tracking",
      headingHighlight: "Perizinan",
      description:
        "Pantau status pengurusan perizinan Anda secara transparan. Masukkan kode transaksi untuk melihat prosesnya sudah sampai tahap mana.",
      imageLabel: "Ilustrasi pemantauan status perizinan",
      ctaTitle: "Tidak Menemukan Nomor Order Anda?",
      ctaSubtitle: "Hubungi tim kami — kami bantu cek status perizinan Anda secara langsung.",
    },
    blogLegalitas: {
      metaTitle: "Legalitas Lengkap, Bisnis Makin Terpercaya",
      metaDescription:
        "Miliki semua legalitas usaha yang dibutuhkan untuk menjalankan bisnis secara aman, profesional, dan dipercaya klien maupun mitra. Konsultasi gratis bersama IzinPro.",
      ctaTitle: "Legalitas Lengkap, Bisnis Makin Terpercaya!",
      ctaSubtitle: "Percayakan semua urusan legalitas usaha Anda kepada tim profesional kami.",
    },
  },

  blogCatalog: {
    ariaSearchSection: "Pencarian artikel",
    searchPlaceholder: "Cari artikel, topik, atau kata kunci...",
    ariaSearchInput: "Cari artikel",
    searchButton: "Cari",
    categoriesHeading: "Kategori",
    popularTopicsHeading: "Topik Populer",
    newsletterHeading: "Dapatkan Update Artikel Terbaru",
    newsletterCopy: "Berlangganan newsletter kami untuk mendapatkan insight dan informasi terbaru.",
    newsletterThanks: "Terima kasih! Anda sudah berlangganan.",
    newsletterPlaceholder: "Masukkan email Anda",
    ariaNewsletterInput: "Email untuk newsletter",
    newsletterButton: "Berlangganan",
    newsletterPrivacy: "Kami tidak akan membagikan email Anda kepada pihak ketiga.",
    latestArticlesHeading: "Artikel Terbaru",
    sortNewest: "Terbaru",
    sortOldest: "Terlama",
    ariaSort: "Urutkan artikel",
    emptyTitle: "Artikel tidak ditemukan",
    emptyCopy: "Coba kata kunci lain atau reset filter pencarian.",
    resetFilter: "Reset Filter",
    ariaThumbnailTemplate: "Thumbnail artikel {title}",
    readMore: "Baca Selengkapnya",
    ariaPaginationNav: "Navigasi halaman artikel",
    prevPage: "Sebelumnya",
    nextPage: "Selanjutnya",
    allArticles: "Semua Artikel",
    readTimeTemplate: "{minutes} menit baca",
  },

  blogComment: {
    successTitle: "Komentar Terkirim!",
    successCopy: "Terima kasih, komentar Anda akan tampil setelah disetujui oleh admin.",
    sendAgain: "Kirim Komentar Lagi",
    nameLabel: "Nama",
    emailLabel: "Email",
    commentLabel: "Komentar",
    namePlaceholder: "Nama Anda",
    emailPlaceholder: "Email Anda (tidak ditampilkan publik)",
    commentPlaceholder: "Tulis komentar Anda di sini...",
    sending: "Mengirim...",
    send: "Kirim Komentar",
    validation: {
      nameMin: "Nama minimal 3 karakter",
      emailInvalid: "Format email tidak valid",
      commentMin: "Komentar minimal 5 karakter",
    },
  },

  blogComments: {
    headingTemplate: "Komentar ({count})",
    leaveCommentHeading: "Tinggalkan Komentar",
  },

  blogDetailProse: {
    waMessage: "Halo IzinPro, saya membaca artikel di website dan ingin konsultasi lebih lanjut.",
    tocHeading: "Daftar Isi",
    helpHeading: "Butuh Bantuan?",
    helpCopy: "Konsultasikan kebutuhan perizinan bisnis Anda gratis bersama tim ahli kami.",
    helpButton: "Konsultasikan Gratis",
    relatedHeading: "Artikel Terkait",
    ariaThumbnailTemplate: "Thumbnail artikel {title}",
  },

  kontakForm: {
    successTitle: "Pesan Terkirim!",
    successCopy: "Terima kasih, tim kami akan menghubungi Anda maksimal 1×24 jam kerja.",
    sendAgain: "Kirim Pesan Lagi",
    nameLabel: "Nama Lengkap",
    emailLabel: "Email",
    whatsappLabel: "No. WhatsApp",
    serviceLabel: "Layanan yang Dibutuhkan",
    messageLabel: "Pesan",
    namePlaceholder: "Masukkan nama lengkap Anda",
    emailPlaceholder: "Masukkan email Anda",
    whatsappPlaceholder: "Contoh: 0812-3456-7890",
    messagePlaceholder: "Tuliskan kebutuhan atau pertanyaan Anda di sini...",
    servicePlaceholder: "Pilih layanan",
    otherOption: "Lainnya",
    sending: "Mengirim...",
    send: "Kirim Pesan",
    privacyNote: "Data Anda aman dan tidak akan dibagikan kepada pihak ketiga.",
    validation: {
      nameMin: "Nama minimal 3 karakter",
      emailInvalid: "Format email tidak valid",
      whatsappMin: "Nomor WhatsApp minimal 9 digit",
      whatsappDigitsOnly: "Nomor hanya boleh berisi angka",
      serviceRequired: "Pilih layanan yang dibutuhkan",
      messageMin: "Pesan minimal 10 karakter",
    },
  },

  kontakLocation: {
    mapTitle: "Peta lokasi kantor IzinPro",
    button: "Lihat di Google Maps",
  },

  layananHero: {
    breadcrumbLayanan: "Layanan",
    headingPrefix: "Daftar",
    headingHighlight: "Layanan",
    subtitle: "Berbagai layanan perizinan untuk mendukung legalitas dan kelancaran bisnis Anda.",
    ariaImage: "Ilustrasi konsultan IzinPro menganalisis dokumen perizinan",
  },

  layananCatalog: {
    headingPrefix: "Solusi Perizinan untuk",
    headingHighlight: "Setiap Kebutuhan Bisnis Anda",
    ariaFilter: "Filter kategori layanan",
    cardLink: "Selengkapnya",
    ariaIllustrationTemplate: "Ilustrasi layanan {title}",
    highlightsAriaLabel: "Keunggulan layanan IzinPro",
    highlights: [
      "Proses Cepat & Efisien",
      "Legal & Resmi 100%",
      "Tim Profesional Berpengalaman",
      "Layanan Transparan",
      "Konsultasi Gratis",
    ],
  },

  layananConsult: {
    waMessage: "Halo IzinPro, saya ingin konsultasi memilih layanan perizinan yang tepat untuk bisnis saya.",
    headingPrefix: "Butuh Layanan Perizinan",
    headingHighlight: "yang Tepat untuk Bisnis Anda?",
    subtitle: "Konsultasikan kebutuhan Anda sekarang juga secara gratis bersama tim ahli kami.",
    button: "Konsultasikan Gratis Sekarang",
    ariaImage: "Foto tim IzinPro siap membantu konsultasi Anda",
  },

  layananDetailHero: {
    breadcrumbLayanan: "Layanan",
    waMessageTemplate: "Halo IzinPro, saya ingin konsultasi tentang layanan {title}.",
    button: "Konsultasikan Sekarang",
    ariaIllustrationTemplate: "Ilustrasi layanan {title}",
    ariaRating: "Rating 5 dari 5 bintang",
  },

  layananDetailPricing: {
    popularBadge: "Paling Populer",
    waMessageTemplate: "Halo IzinPro, saya tertarik dengan {name} ({price}) untuk layanan {title}.",
    choosePackage: "Pilih Paket",
    durationHeading: "Waktu Pengerjaan",
  },

  layananDetailTestimonials: {
    heading: "Testimoni Klien",
    ariaRating: "Rating 5 dari 5 bintang",
    button: "Konsultasikan Gratis",
  },

  promoConsult: {
    waMessage: "Halo IzinPro, saya ingin menanyakan promo spesial yang sedang berjalan.",
    imageAlt: "Tim IzinPro siap membantu Anda",
    button: "Konsultasikan Gratis Sekarang",
  },

  promoCountdown: {
    units: { days: "Hari", hours: "Jam", minutes: "Menit", seconds: "Detik" },
    endingIn: "Berakhir dalam:",
  },

  promoPackages: {
    startingFrom: "Mulai dari",
    viewDetail: "Lihat Detail",
  },

  tentangVisiMisi: {
    visionImageAlt: "Ilustrasi gedung perkantoran",
    missionImageAlt: "Ilustrasi misi perusahaan",
    visionHeading: "Visi Kami",
    missionHeading: "Misi Kami",
  },

  tentangTeam: {
    headingSuffix: " Kami",
    ariaPhotoTemplate: "Foto {name}, {role} IzinPro",
    ariaLinkedinTemplate: "LinkedIn {name}",
  },

  testimoniGrid: {
    headingPrefix: "Apa Kata",
    headingHighlight: "Klien Kami?",
    subtitle: "Pengalaman nyata dari klien yang telah menggunakan layanan IzinPro.",
    allTestimoni: "Semua Testimoni",
    ariaFilter: "Filter kategori testimoni",
    ariaRating: "Rating 5 dari 5 bintang",
    emptyState: "Belum ada testimoni untuk kategori ini.",
  },

  trackingForm: {
    heading: "Lacak Status Perizinan Anda",
    subtitle: "Masukkan kode transaksi yang Anda terima via WhatsApp/email saat pendaftaran layanan.",
    placeholder: "Contoh: TRX-20260731-000001",
    ariaInput: "Kode transaksi",
    searching: "Mencari...",
    trackNow: "Lacak Sekarang",
    notFoundHelp: "Periksa kembali penulisan kode transaksi Anda, atau hubungi tim kami untuk bantuan pengecekan langsung.",
    contactUs: "Hubungi Kami",
    detailHeading: "Detail Transaksi",
    statusHeading: "Status Proses Layanan",
    documentsHeading: "Dokumen Tersedia",
    codeLabel: "Kode Transaksi",
    serviceLabel: "Layanan",
    currentStageLabel: "Tahap Saat Ini",
    estimatedCompletionLabel: "Estimasi Selesai",
    progressLabel: "Progress",
    inProgressBadge: "Sedang Berjalan",
  },

  trackingHeroVisual: {
    steps: { registration: "Pendaftaran", verification: "Verifikasi", processing: "Diproses", done: "Selesai" },
    liveStatus: "Live Status",
    documentsReady: "Dokumen Siap Diambil",
    progress: "Progress",
  },

  trackingInfo: {
    headingPrefix: "Bagaimana",
    headingHighlight: "Cara Kerjanya?",
    steps: [
      {
        title: "Dapatkan Nomor Order",
        description: "Nomor order dikirim via WhatsApp/email saat Anda mendaftar layanan IzinPro.",
      },
      {
        title: "Masukkan & Lacak",
        description: "Ketik nomor order di kolom pencarian di atas, lalu klik Lacak Sekarang.",
      },
      {
        title: "Pantau atau Tanyakan",
        description: "Lihat tahapan proses secara langsung, atau hubungi tim kami untuk detail lebih lanjut.",
      },
    ],
  },

  actions: {
    inquiryNameMin: "Nama minimal 3 karakter.",
    inquiryEmailInvalid: "Format email tidak valid.",
    inquiryWhatsappMin: "Nomor WhatsApp minimal 9 digit.",
    inquiryMessageMin: "Pesan minimal 10 karakter.",
    inquiryGenericError: "Gagal mengirim pesan. Coba lagi sebentar lagi.",
    trackingEmptyCode: "Masukkan kode transaksi Anda.",
    trackingNotFound: "Kode transaksi tidak ditemukan. Periksa kembali penulisannya.",
    trackingGenericError: "Gagal melacak transaksi. Coba lagi sebentar lagi.",
    commentNameMin: "Nama minimal 3 karakter.",
    commentEmailInvalid: "Format email tidak valid.",
    commentMin: "Komentar minimal 5 karakter.",
    commentPostNotFound: "Artikel tidak ditemukan.",
    commentGenericError: "Gagal mengirim komentar. Coba lagi sebentar lagi.",
  },
};

export type Dictionary = typeof id;
export default id;
