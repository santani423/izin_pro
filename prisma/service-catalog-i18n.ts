/* ─── Terjemahan EN/ZH utk katalog Layanan (ServiceCategory, Service, ServicePackage)
 * — dipakai bareng: backfill satu-kali `prisma/backfill-layanan-catalog-i18n.ts`
 * DAN `prisma/seed.ts` install baru, biar satu sumber kebenaran (gak ada risiko
 * drift antara dua tempat itu). Key CATALOG_SERVICE_I18N pakai slug Service,
 * key CATALOG_CATEGORY_I18N pakai nama kategori Bahasa Indonesia (constants.ts
 * LAYANAN_CATEGORIES gak punya field terpisah selain label). */

interface CatalogLang2 {
  en: string;
  zh: string;
}
interface CatT {
  name: CatalogLang2;
  description: CatalogLang2 | null;
}
interface PkgT {
  name: CatalogLang2;
  features: CatalogLang2[];
}
interface SvcT {
  title: CatalogLang2;
  description: CatalogLang2;
  features: CatalogLang2[];
  packages: [PkgT, PkgT, PkgT]; // basic, standard, premium (in sortOrder)
}

export const CATALOG_CATEGORY_I18N: Record<string, CatT> = {
  "Pendirian Perusahaan": {
    name: { en: "Company Establishment", zh: "公司设立" },
    description: {
      en: "Setting up a business entity from scratch until it is legally operational.",
      zh: "从零开始设立企业,直至合法运营。",
    },
  },
  "Perizinan Usaha": { name: { en: "Business Licensing", zh: "营业许可" }, description: null },
  "Perizinan Operasional": { name: { en: "Operational Licensing", zh: "运营许可" }, description: null },
  "Perizinan Lainnya": { name: { en: "Other Licensing", zh: "其他许可" }, description: null },
};

function genericPackages(titleEn: string, titleZh: string): [PkgT, PkgT, PkgT] {
  return [
    {
      name: { en: "Basic Package", zh: "基础套餐" },
      features: [
        { en: "Consultation & Needs Analysis", zh: "咨询与需求分析" },
        { en: `Processing of ${titleEn}`, zh: `办理${titleZh}` },
        { en: "Process Assistance", zh: "流程陪同服务" },
      ],
    },
    {
      name: { en: "Standard Package", zh: "标准套餐" },
      features: [
        { en: "Consultation & Needs Analysis", zh: "咨询与需求分析" },
        { en: `Processing of ${titleEn}`, zh: `办理${titleZh}` },
        { en: "Document Review & Preparation", zh: "文件核对与准备" },
        { en: "Faster Processing", zh: "更快速的办理流程" },
      ],
    },
    {
      name: { en: "Premium Package", zh: "高级套餐" },
      features: [
        { en: "Consultation & Needs Analysis", zh: "咨询与需求分析" },
        { en: `Processing of ${titleEn}`, zh: `办理${titleZh}` },
        { en: "Full Assistance", zh: "全程陪同服务" },
        { en: "Priority Handling", zh: "优先处理" },
        { en: "Completion Guarantee", zh: "保证完成" },
      ],
    },
  ];
}

export const CATALOG_SERVICE_I18N: Record<string, SvcT> = {
  "pendirian-pt": {
    title: { en: "Company (PT) Establishment", zh: "PT有限公司设立" },
    description: {
      en: "We help establish your PT (limited liability company) quickly, easily, and legally in accordance with the latest Indonesian government regulations.",
      zh: "我们协助您根据印尼政府最新法规,快速、便捷且合法地设立PT有限公司。",
    },
    features: [
      { en: "Deed of Establishment", zh: "设立契约书" },
      { en: "Ministry of Law Decree (SK Kemenkumham)", zh: "法律部核准函(SK Kemenkumham)" },
      { en: "Company Tax ID (NPWP)", zh: "公司税号(NPWP)" },
      { en: "Company Domicile", zh: "公司注册地址" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: [
      {
        name: { en: "Basic Package", zh: "基础套餐" },
        features: [
          { en: "Deed of Establishment", zh: "设立契约书" },
          { en: "Ministry of Law Decree (SK Kemenkumham)", zh: "法律部核准函" },
          { en: "Company Tax ID (NPWP)", zh: "公司税号(NPWP)" },
        ],
      },
      {
        name: { en: "Standard Package", zh: "标准套餐" },
        features: [
          { en: "Deed of Establishment", zh: "设立契约书" },
          { en: "Ministry of Law Decree (SK Kemenkumham)", zh: "法律部核准函" },
          { en: "Company Tax ID (NPWP)", zh: "公司税号(NPWP)" },
          { en: "Complete Documents", zh: "完整文件" },
        ],
      },
      {
        name: { en: "Premium Package", zh: "高级套餐" },
        features: [
          { en: "All Standard Package Benefits", zh: "标准套餐全部服务" },
          { en: "Business License (SIUP) / NIB", zh: "营业许可证(SIUP)/NIB" },
          { en: "Basic Licensing Documents", zh: "基本许可文件" },
        ],
      },
    ],
  },
  nib: {
    title: { en: "NIB (Business Identification Number)", zh: "NIB(企业识别号)" },
    description: {
      en: "Obtain your NIB easily, quickly, and officially through the government's integrated OSS system.",
      zh: "通过政府一体化OSS系统,轻松、快速、正式地办理NIB。",
    },
    features: [
      { en: "OSS Registration", zh: "OSS系统注册" },
      { en: "Business Data Verification", zh: "企业数据核实" },
      { en: "Official NIB Issuance", zh: "正式颁发NIB" },
      { en: "Real-time Status Update", zh: "实时状态更新" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: [
      {
        name: { en: "Basic Package", zh: "基础套餐" },
        features: [
          { en: "Individual NIB", zh: "个人NIB" },
          { en: "Consultation & Assistance", zh: "咨询与陪同服务" },
        ],
      },
      {
        name: { en: "Standard Package", zh: "标准套餐" },
        features: [
          { en: "Company NIB (PT/CV/Partnership)", zh: "企业NIB(PT/CV/合伙)" },
          { en: "Consultation & Assistance", zh: "咨询与陪同服务" },
          { en: "Business KBLI Code Review", zh: "企业KBLI编码核查" },
          { en: "NIB Submission via OSS", zh: "通过OSS提交NIB申请" },
        ],
      },
      {
        name: { en: "Premium Package", zh: "高级套餐" },
        features: [
          { en: "Company NIB + PKKPR", zh: "企业NIB + PKKPR" },
          { en: "Consultation & Assistance", zh: "咨询与陪同服务" },
          { en: "Business KBLI Code Preparation", zh: "企业KBLI编码编制" },
          { en: "Business Document Review", zh: "企业文件审核" },
        ],
      },
    ],
  },
  "izin-usaha": {
    title: { en: "Business License", zh: "营业许可证" },
    description: {
      en: "Various business licenses tailored to your industry, with a transparent process and no hidden fees.",
      zh: "根据您的行业提供各类营业许可,流程透明,无隐藏费用。",
    },
    features: [
      { en: "License Type Analysis", zh: "许可证类型分析" },
      { en: "Document Preparation", zh: "文件准备" },
      { en: "Submission to Authorities", zh: "向相关机构提交申请" },
      { en: "Process Monitoring", zh: "流程监控" },
      { en: "Completion Guarantee", zh: "保证完成" },
    ],
    packages: [
      {
        name: { en: "Basic Package", zh: "基础套餐" },
        features: [
          { en: "Consultation & Needs Analysis", zh: "咨询与需求分析" },
          { en: "Processing of 1 License Type", zh: "办理1种许可证" },
        ],
      },
      {
        name: { en: "Standard Package", zh: "标准套餐" },
        features: [
          { en: "Consultation & Needs Analysis", zh: "咨询与需求分析" },
          { en: "Processing of Up to 3 License Types", zh: "办理最多3种许可证" },
          { en: "Document Assistance & Revision", zh: "文件协助与修改" },
          { en: "Faster Processing", zh: "更快速的办理流程" },
        ],
      },
      {
        name: { en: "Premium Package", zh: "高级套餐" },
        features: [
          { en: "Consultation & Needs Analysis", zh: "咨询与需求分析" },
          { en: "Processing of All License Types", zh: "办理所有类型许可证" },
          { en: "Full Assistance", zh: "全程陪同服务" },
          { en: "License Issuance Guarantee", zh: "保证颁发许可证" },
        ],
      },
    ],
  },
  "izin-komersial": {
    title: { en: "Commercial & Operational License", zh: "商业与运营许可证" },
    description: {
      en: "Operational licenses to keep your commercial business activities running smoothly in accordance with applicable regulations.",
      zh: "根据现行法规办理运营许可证,保障您的商业经营活动顺利进行。",
    },
    features: [
      { en: "Distribution License", zh: "流通许可证" },
      { en: "Halal Certificate", zh: "清真认证" },
      { en: "BPOM License", zh: "BPOM许可证" },
      { en: "SNI Certification", zh: "SNI认证" },
      { en: "Operational License", zh: "运营许可证" },
    ],
    packages: genericPackages("Commercial & Operational License", "商业与运营许可证"),
  },
  "perizinan-lainnya": {
    title: { en: "Other Licensing Services", zh: "其他许可服务" },
    description: {
      en: "Comprehensive other licensing services tailored to your business's specific needs, available throughout Indonesia.",
      zh: "根据企业的具体需求,提供覆盖印尼全境的综合性其他许可服务。",
    },
    features: [
      { en: "Location Permit", zh: "选址许可证" },
      { en: "Business Certification", zh: "企业认证" },
      { en: "Company Data Changes", zh: "公司资料变更" },
      { en: "Company Closure", zh: "公司注销" },
      { en: "Special Consultation", zh: "专项咨询" },
    ],
    packages: genericPackages("Other Licensing Services", "其他许可服务"),
  },
  "pt-perorangan": {
    title: { en: "Individual PT (Sole Proprietorship Company)", zh: "个人PT(独资有限公司)" },
    description: {
      en: "Establishment of Individual PT for micro and small business owners with a simpler process and affordable cost.",
      zh: "为微型和小型企业主提供个人PT设立服务,流程更简便、费用更实惠。",
    },
    features: [
      { en: "Individual PT Deed", zh: "个人PT设立契约" },
      { en: "Ministry of Law Decree (SK Kemenkumham)", zh: "法律部核准函" },
      { en: "Company Tax ID (NPWP)", zh: "公司税号(NPWP)" },
      { en: "Automatic NIB", zh: "自动获取NIB" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("Individual PT", "个人PT"),
  },
  "cv-firma": {
    title: { en: "CV & Partnership Firm", zh: "CV(两合公司)与合伙企业" },
    description: {
      en: "Establishment of CV and Partnership Firm as the right business entity for partnerships and joint ventures.",
      zh: "为合伙经营与联合创业提供合适的企业形式——CV(两合公司)与合伙企业设立服务。",
    },
    features: [
      { en: "CV/Partnership Deed", zh: "CV/合伙企业设立契约" },
      { en: "District Court Registration", zh: "地方法院登记" },
      { en: "Business Tax ID (NPWP)", zh: "企业税号(NPWP)" },
      { en: "Integrated NIB", zh: "一体化NIB" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("CV & Partnership Firm", "CV与合伙企业"),
  },
  pma: {
    title: { en: "PMA (Foreign Investment Company)", zh: "PMA(外商投资公司)" },
    description: {
      en: "Establishment of a Foreign Investment Company (PMA) for foreign investors who want to do business officially in Indonesia.",
      zh: "为希望在印尼正式经营的外国投资者提供外商投资公司(PMA)设立服务。",
    },
    features: [
      { en: "BKPM Principle License", zh: "BKPM原则许可" },
      { en: "PMA Deed", zh: "PMA设立契约" },
      { en: "LKPM (Investment Activity Report)", zh: "LKPM(投资活动报告)" },
      { en: "Location & Business License", zh: "选址与经营许可" },
      { en: "Investment Consultation", zh: "投资咨询" },
    ],
    packages: genericPackages("PMA", "PMA"),
  },
  "npwp-badan-pkp": {
    title: { en: "Corporate Tax ID (NPWP) & PKP", zh: "企业税号(NPWP)与PKP" },
    description: {
      en: "Processing of Corporate Tax ID (NPWP) and Taxable Entrepreneur Confirmation (PKP) for your business tax needs.",
      zh: "为企业税务需求办理企业税号(NPWP)及应税企业家认定(PKP)。",
    },
    features: [
      { en: "Corporate Tax ID (NPWP)", zh: "企业税号(NPWP)" },
      { en: "PKP Confirmation", zh: "PKP认定" },
      { en: "Tax Consultation", zh: "税务咨询" },
      { en: "Tax Return (SPT) Preparation", zh: "纳税申报表(SPT)制作" },
      { en: "Tax Office (DJP) Assistance", zh: "税务局(DJP)陪同服务" },
    ],
    packages: genericPackages("Corporate Tax ID (NPWP) & PKP", "企业税号(NPWP)与PKP"),
  },
  "pendaftaran-merk": {
    title: { en: "Trademark Registration", zh: "商标注册" },
    description: {
      en: "Register your trademark with DJKI for strong legal protection and safeguard against counterfeiting.",
      zh: "在DJKI(知识产权总局)注册商标,获得强有力的法律保护,防止仿冒。",
    },
    features: [
      { en: "Trademark Class Consultation", zh: "商标类别咨询" },
      { en: "Trademark Search", zh: "商标查询" },
      { en: "Submission to DJKI", zh: "向DJKI提交申请" },
      { en: "Status Monitoring", zh: "状态监控" },
      { en: "Trademark Certificate", zh: "商标证书" },
    ],
    packages: genericPackages("Trademark Registration", "商标注册"),
  },
  "virtual-office": {
    title: { en: "Virtual Office", zh: "虚拟办公室" },
    description: {
      en: "Professional business address solution without renting physical office space, complete with mail handling and meeting room services.",
      zh: "无需承租实体办公室即可获得专业商务地址,并附带信件收发及会议室服务。",
    },
    features: [
      { en: "Official Business Address", zh: "正式商务地址" },
      { en: "Mail Handling Service", zh: "信件收发服务" },
      { en: "Professional Receptionist", zh: "专业接待服务" },
      { en: "Meeting Room", zh: "会议室" },
      { en: "Flexible Packages", zh: "灵活套餐" },
    ],
    packages: genericPackages("Virtual Office", "虚拟办公室"),
  },
  "perizinan-lokasi": {
    title: { en: "Location Permit", zh: "选址许可证" },
    description: {
      en: "We help process business location permits easily and quickly in accordance with regional spatial planning.",
      zh: "协助根据区域空间规划,轻松快速地办理经营选址许可证。",
    },
    features: [
      { en: "Spatial Planning Analysis", zh: "空间规划分析" },
      { en: "Location Permit via OSS", zh: "通过OSS办理选址许可" },
      { en: "KKPR Approval", zh: "KKPR批准" },
      { en: "Regional Agency Coordination", zh: "地方机构协调" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("Location Permit", "选址许可证"),
  },
  sertifikasi: {
    title: { en: "Certification", zh: "认证服务" },
    description: {
      en: "Processing of official certifications to increase the trust and competitiveness of your business.",
      zh: "办理正式认证,提升企业的信誉与竞争力。",
    },
    features: [
      { en: "SNI Certification", zh: "SNI认证" },
      { en: "Halal Certificate", zh: "清真认证" },
      { en: "ISO & SMK3", zh: "ISO与SMK3认证" },
      { en: "Certificate of Function Compliance", zh: "功能合格证书" },
      { en: "Audit Assistance", zh: "审核陪同服务" },
    ],
    packages: genericPackages("Certification", "认证服务"),
  },
  "perizinan-impor": {
    title: { en: "Import License", zh: "进口许可证" },
    description: {
      en: "Import licensing services to support the smooth running of your business activities.",
      zh: "提供进口许可服务,保障您的经营活动顺利进行。",
    },
    features: [
      { en: "Import Identification Number (API)", zh: "进口识别号(API)" },
      { en: "Customs NIB", zh: "海关NIB" },
      { en: "Import Approval", zh: "进口批准" },
      { en: "Customs Registration", zh: "海关注册" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("Import License", "进口许可证"),
  },
  "izin-industri": {
    title: { en: "Industrial License", zh: "工业许可证" },
    description: {
      en: "We help process industrial business licenses in accordance with applicable regulations.",
      zh: "协助根据现行法规办理工业营业许可证。",
    },
    features: [
      { en: "Industrial Business License (IUI)", zh: "工业营业许可证(IUI)" },
      { en: "Technical Verification", zh: "技术核实" },
      { en: "SIINas Registration", zh: "SIINas系统注册" },
      { en: "Industrial Activity Report", zh: "工业活动报告" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("Industrial License", "工业许可证"),
  },
  "lingkungan-hidup": {
    title: { en: "Environmental Permit", zh: "环境许可证" },
    description: {
      en: "Environmental licensing to support a sustainable and compliant business.",
      zh: "环境许可服务,助力企业实现可持续经营并符合法规要求。",
    },
    features: [
      { en: "SPPL (Environmental Management Statement)", zh: "环境管理承诺书(SPPL)" },
      { en: "UKL-UPL (Environmental Management & Monitoring Plan)", zh: "UKL-UPL(环境管理与监测计划)" },
      { en: "AMDAL (Environmental Impact Assessment)", zh: "AMDAL(环境影响评估)" },
      { en: "Environmental Approval", zh: "环境批准" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("Environmental Permit", "环境许可证"),
  },
  "perizinan-konstruksi": {
    title: { en: "Construction Permit", zh: "建筑许可证" },
    description: {
      en: "Processing of construction permits for the smooth running of your building project.",
      zh: "办理建筑许可证,保障您的建筑项目顺利进行。",
    },
    features: [
      { en: "PBG (Building Approval, replacing IMB)", zh: "PBG(建筑批准,取代IMB)" },
      { en: "SLF (Certificate of Function Compliance)", zh: "SLF(功能合格证书)" },
      { en: "Construction Business Entity Certificate (SBU)", zh: "建筑企业资质证书(SBU)" },
      { en: "Construction Services Business License (IUJK)", zh: "建筑服务营业许可证(IUJK)" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("Construction Permit", "建筑许可证"),
  },
  "perubahan-pembaruan-izin": {
    title: { en: "License Amendment & Renewal", zh: "许可证变更与更新" },
    description: {
      en: "Amendment or renewal services for your business license data to keep your legal status valid.",
      zh: "为保持企业合法地位有效,提供营业许可证资料变更或更新服务。",
    },
    features: [
      { en: "Company Deed Amendment", zh: "公司契约变更" },
      { en: "OSS Data Update", zh: "OSS资料更新" },
      { en: "License Renewal", zh: "许可证延期" },
      { en: "KBLI Code Change", zh: "KBLI编码变更" },
      { en: "Free Consultation", zh: "免费咨询" },
    ],
    packages: genericPackages("License Amendment & Renewal", "许可证变更与更新"),
  },
};
