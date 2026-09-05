/* Sumber nav header/footer (ID/EN/ZH) — dipakai bareng prisma/seed.ts (fresh
 * install) & prisma/backfill-menu-i18n.ts (isi labelEn/labelZh utk instalasi
 * lama yang menu-nya udah ke-seed sebelum kolom i18n itu ada). Urutan array
 * ini WAJIB sama persis dgn urutan create di seed.ts (backfill match posisi
 * per sortOrder, bukan by href, krn 3 kolom footer sama-sama href "#"). */

export const NAV_LINKS = [
  { label: "Beranda", labelEn: "Home", labelZh: "首页", href: "/" },
  {
    label: "Layanan",
    labelEn: "Services",
    labelZh: "服务",
    href: "/layanan",
    children: [
      {
        label: "Pendirian PT",
        labelEn: "Company Establishment (PT)",
        labelZh: "公司注册（PT）",
        href: "/layanan/pendirian-pt",
      },
      {
        label: "NIB (Nomor Induk Berusaha)",
        labelEn: "NIB (Business Identification Number)",
        labelZh: "NIB（营业识别号）",
        href: "/layanan/nib",
      },
      {
        label: "Izin Usaha",
        labelEn: "Business License",
        labelZh: "营业执照",
        href: "/layanan/izin-usaha",
      },
      {
        label: "Izin Komersial & Operasional",
        labelEn: "Commercial & Operational License",
        labelZh: "商业及运营许可证",
        href: "/layanan/izin-komersial",
      },
      {
        label: "Perizinan Lainnya",
        labelEn: "Other Licenses",
        labelZh: "其他许可证",
        href: "/layanan/perizinan-lainnya",
      },
    ],
  },
  { label: "Tentang Kami", labelEn: "About Us", labelZh: "关于我们", href: "/tentang-kami" },
  {
    label: "Panduan & Artikel",
    labelEn: "Guides & Articles",
    labelZh: "指南与文章",
    href: "/blog",
  },
  { label: "Testimoni", labelEn: "Testimonials", labelZh: "客户评价", href: "/testimoni" },
  { label: "Promo", labelEn: "Promotions", labelZh: "优惠活动", href: "/promo" },
  { label: "Kontak", labelEn: "Contact", labelZh: "联系我们", href: "/kontak" },
];

export const FOOTER_COLUMNS = [
  {
    title: "Layanan Kami",
    titleEn: "Our Services",
    titleZh: "我们的服务",
    links: [
      {
        label: "Pendirian PT",
        labelEn: "Company Establishment (PT)",
        labelZh: "公司注册（PT）",
        href: "/layanan/pendirian-pt",
      },
      {
        label: "NIB & Berusaha",
        labelEn: "NIB & Business Licensing",
        labelZh: "NIB 与营业许可",
        href: "/layanan/nib",
      },
      {
        label: "Izin Usaha",
        labelEn: "Business License",
        labelZh: "营业执照",
        href: "/layanan/izin-usaha",
      },
      {
        label: "Izin Komersial & Operasional",
        labelEn: "Commercial & Operational License",
        labelZh: "商业及运营许可证",
        href: "/layanan/izin-komersial",
      },
      {
        label: "Perizinan Lainnya",
        labelEn: "Other Licenses",
        labelZh: "其他许可证",
        href: "/layanan/perizinan-lainnya",
      },
    ],
  },
  {
    title: "Informasi",
    titleEn: "Information",
    titleZh: "信息",
    links: [
      {
        label: "Tentang Kami",
        labelEn: "About Us",
        labelZh: "关于我们",
        href: "/tentang-kami",
      },
      {
        label: "Panduan & Artikel",
        labelEn: "Guides & Articles",
        labelZh: "指南与文章",
        href: "/blog",
      },
      { label: "Testimoni", labelEn: "Testimonials", labelZh: "客户评价", href: "/testimoni" },
      { label: "Promo", labelEn: "Promotions", labelZh: "优惠活动", href: "/promo" },
      {
        label: "Tracking Perizinan",
        labelEn: "Licensing Tracking",
        labelZh: "办证进度查询",
        href: "/tracking",
      },
    ],
  },
  {
    title: "Bantuan",
    titleEn: "Help",
    titleZh: "帮助",
    links: [
      { label: "FAQ", labelEn: "FAQ", labelZh: "常见问题", href: "/faq" },
      {
        label: "Syarat & Ketentuan",
        labelEn: "Terms & Conditions",
        labelZh: "条款与细则",
        href: "/syarat-ketentuan",
      },
      {
        label: "Kebijakan Privasi",
        labelEn: "Privacy Policy",
        labelZh: "隐私政策",
        href: "/kebijakan-privasi",
      },
      {
        label: "Hubungi Kami",
        labelEn: "Contact Us",
        labelZh: "联系我们",
        href: "/kontak",
      },
    ],
  },
];
