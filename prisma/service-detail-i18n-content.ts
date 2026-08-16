/* ─── Terjemahan EN/ZH utk Service.detailContent (dipakai bareng: backfill
 * satu-kali `prisma/backfill-layanan-i18n.ts` DAN `prisma/seed.ts` install
 * baru) — satu sumber kebenaran biar dua tempat itu gak collision. 15 dari
 * 18 layanan pakai template generik yang sama persis dgn buildFallbackDetail()
 * di src/lib/layanan-detail.ts (cuma judul/deskripsi/checklist yang beda per
 * layanan), 3 sisanya (pendirian-pt, nib, izin-usaha) konten aslinya unik jadi
 * diterjemahkan manual per field. */
import type { ServiceDetailContentLang } from "../src/lib/service-detail-locale";

/** Template konten fallback (15 layanan generik) — EN. Cocok dgn
 * fallbackContent() di hydrate-layanan-detail.ts: highlight/stats/process
 * steps/dokumen/durasi/testimonialsHelp/faqsTitle konstan, cuma title +
 * deskripsi + checklist (features) yang di-parameter-kan. */
export function genericDetailEn(title: string, checklist: string[]): ServiceDetailContentLang {
  return {
    kicker: "Services",
    tagline: "Fast, Easy & 100% Legal",
    highlights: [
      { label: "Fast & Efficient Process" },
      { label: "100% Legal & Official" },
      { label: "Free Consultation" },
      { label: "Transparent Pricing" },
    ],
    stats: [{ value: "5,000+", label: "Licenses Completed" }, { value: "99%", label: "Client Satisfaction" }],
    about: {
      title: `What is ${title}?`,
      checklist,
      imageLabel: `${title} service illustration`,
    },
    process: {
      title: `${title} Process`,
      steps: [
        { title: "Consultation", description: "Free initial consultation via WhatsApp." },
        { title: "Data Collection", description: "We will request the necessary data and documents." },
        { title: "Submission", description: "Submission to the relevant authority." },
        { title: "Monitoring", description: "Regular process monitoring." },
        { title: "Completed", description: "Licensing completed & documents handed over." },
      ],
    },
    packagesTitle: `Choose Your ${title} Package`,
    documents: {
      title: "Required Documents (General)",
      items: [
        "Responsible Person's ID Card (KTP)",
        "Personal / Company Tax ID (NPWP)",
        "Business Address & Domicile",
        "Active Email & Phone Number",
        "Related Legal Documents (if any)",
      ],
    },
    duration: { value: "3 – 7 Business Days", note: "(depending on data completeness)" },
    testimonialsHelp: { title: "Need Help?", description: `Consult your ${title} needs now!` },
    faqsTitle: "Frequently Asked Questions",
  };
}

/** Sama kayak genericDetailEn tapi Mandarin. */
export function genericDetailZh(title: string, checklist: string[]): ServiceDetailContentLang {
  return {
    kicker: "服务",
    tagline: "快速、简便、100%合法",
    highlights: [
      { label: "快速高效的流程" },
      { label: "100%合法正规" },
      { label: "免费咨询" },
      { label: "费用透明" },
    ],
    stats: [{ value: "5,000+", label: "已完成许可证办理" }, { value: "99%", label: "客户满意度" }],
    about: {
      title: `什么是${title}?`,
      checklist,
      imageLabel: `${title}服务插图`,
    },
    process: {
      title: `${title}办理流程`,
      steps: [
        { title: "咨询", description: "通过WhatsApp进行免费初步咨询。" },
        { title: "资料收集", description: "我们将向您索取所需的资料与文件。" },
        { title: "提交申请", description: "向相关机构提交申请。" },
        { title: "监控进度", description: "定期监控办理进度。" },
        { title: "完成", description: "许可办理完成,文件已交付。" },
      ],
    },
    packagesTitle: `选择您的${title}套餐`,
    documents: {
      title: "所需文件(通用)",
      items: [
        "负责人身份证(KTP)",
        "个人/公司税号(NPWP)",
        "企业地址与营业场所",
        "有效邮箱与电话号码",
        "相关法律文件(如有)",
      ],
    },
    duration: { value: "3 – 7个工作日", note: "(视资料完整程度而定)" },
    testimonialsHelp: { title: "需要帮助?", description: `立即咨询您的${title}需求!` },
    faqsTitle: "常见问题",
  };
}

/** 3 layanan dengan detailContent asli (hand-authored, bukan fallback generik)
 * — diterjemahkan manual per field, bukan lewat template. */
export const CUSTOM_DETAIL_EN: Record<string, ServiceDetailContentLang> = {
  "pendirian-pt": {
    kicker: "Services",
    tagline: "Easy, Fast & 100% Legal",
    heroDescription:
      "We help you establish your PT professionally in accordance with legal regulations, with a fast, transparent, and secure process.",
    highlights: [
      { label: "Fast & Efficient Process" },
      { label: "100% Legal & Official" },
      { label: "Free Consultation" },
      { label: "Transparent Pricing" },
    ],
    stats: [{ value: "5,000+", label: "Companies Assisted" }, { value: "99%", label: "Client Satisfaction" }],
    about: {
      title: "What is Company (PT) Establishment?",
      paragraphs: [
        "Establishing a PT is a legal process to set up a business entity in the form of a Limited Liability Company that has official legal entity status from the state.",
        "A PT offers many advantages such as legal protection, higher business credibility, and ease in business development.",
      ],
      imageLabel: "Illustration of a legally incorporated company building",
      badge: "Legal & Trusted",
    },
    benefits: {
      title: "Benefits of Establishing a PT",
      items: [
        { title: "Official Legal Entity", description: "Legally recognized and protected by the state." },
        { title: "High Credibility", description: "Increases trust from clients, partners & investors." },
        { title: "Wider Access", description: "Facilitates access to funding, partnerships & project tenders." },
        { title: "Personal Protection", description: "Owner's personal assets are not mixed with company assets." },
        { title: "Easy Scalability", description: "Easy to grow and open other business branches." },
      ],
    },
    process: {
      title: "PT Establishment Process",
      steps: [
        { title: "Consultation", description: "Consultation on your needs & business type." },
        { title: "Data Collection", description: "We will request the necessary data and documents." },
        { title: "Deed Drafting", description: "Drafting of the PT establishment deed by a notary." },
        { title: "Legalization", description: "Processing of the Ministry of Law Decree (SK Kemenkumham) as a legal entity." },
        { title: "Documents Completed", description: "All complete documents ready to be handed over." },
      ],
    },
    packagesTitle: "Choose Your PT Establishment Package",
    documents: {
      title: "Required Documents",
      items: [
        "Directors' & Commissioners' ID Cards (KTP)",
        "Personal Tax ID (NPWP)",
        "Business Address",
        "Active Email",
        "Company Name & Business Field",
      ],
    },
    duration: { value: "3 – 7 Business Days", note: "(depending on data completeness)" },
    testimonialsHelp: { title: "Need Help?", description: "Consult your PT establishment needs now!" },
    faqsTitle: "FAQ About Company (PT) Establishment",
    cta: { title: "Ready to Establish Your PT?", subtitle: "Entrust your PT establishment to our professional team." },
  },
  nib: {
    kicker: "NIB Services",
    tagline: "The First Step to Your Business Legality",
    heroDescription: "Get your NIB easily, quickly, and officially through the OSS (Online Single Submission) system.",
    highlights: [
      { label: "Fast Process 1–3 Business Days" },
      { label: "100% Legal & Official" },
      { label: "Free Consultation" },
      { label: "Transparent Pricing" },
    ],
    stats: [{ value: "5,000+", label: "Entrepreneurs Assisted" }, { value: "99%", label: "Client Satisfaction" }],
    about: {
      title: "What is NIB?",
      paragraphs: [
        "NIB (Business Identification Number) is the official identity of a business operator issued by the government through the OSS system. NIB serves as the basic legality for running business activities.",
      ],
      checklist: [
        "Official identity of the business operator",
        "Main requirement for licensing and access to government facilities",
        "Serves as a Company Registration Certificate (TDP)",
        "Valid indefinitely as long as the business is running",
      ],
      imageLabel: "Illustration of NIB document",
    },
    benefits: {
      title: "Benefits of Having an NIB",
      items: [
        { title: "Official Legality", description: "Your business becomes legitimate and recognized by the government." },
        { title: "Licensing Access", description: "Facilitates the application of other business licenses." },
        { title: "Ease of Doing Business", description: "Increases trust from consumers & business partners." },
        { title: "Wider Opportunities", description: "Enables participation in tenders, partnerships & exports." },
        { title: "Government Facilities", description: "Access to government assistance and financing programs." },
      ],
    },
    process: {
      title: "NIB Application Process",
      steps: [
        { title: "Consultation", description: "Tell us about your business needs." },
        { title: "Data Collection", description: "We will request the necessary data and documents." },
        { title: "OSS Submission", description: "NIB application through the OSS system." },
        { title: "NIB Issued", description: "Your NIB is issued and ready to use." },
        { title: "Assistance", description: "We help ensure the process runs smoothly." },
      ],
    },
    packagesTitle: "Choose Your NIB Package",
    documents: {
      title: "Required Documents",
      items: ["Responsible Person's ID Card (KTP)", "Tax ID / NPWP (if any)", "Business Address", "Active Email", "Business Field / KBLI"],
    },
    duration: { value: "1 – 3 Business Days", note: "(depending on data completeness)" },
    testimonialsHelp: { title: "Need Help?", description: "Our team is ready to help you get your NIB quickly and easily." },
    faqsTitle: "FAQ About NIB",
    cta: {
      title: "Start Your Business Legality Now!",
      subtitle: "Get your official NIB and increase your business opportunities with us.",
    },
  },
  "izin-usaha": {
    kicker: "Business License Services",
    tagline: "Complete Legality for Smooth Business Operations",
    heroDescription:
      "We help you obtain various types of business licenses according to your business field, quickly, safely, and reliably.",
    highlights: [
      { label: "Fast & Efficient Process" },
      { label: "100% Legal & Official" },
      { label: "Experienced Professional Team" },
      { label: "Free Consultation" },
    ],
    stats: [{ value: "2,000+", label: "Business Licenses Issued" }, { value: "98%", label: "Client Satisfaction" }],
    about: {
      title: "What is a Business License?",
      paragraphs: [
        "A Business License is a legal document issued by an authorized agency as valid proof that your business activities have met the applicable requirements and provisions.",
      ],
      checklist: [
        "Valid proof of business legality recognized by the government",
        "Opens opportunities for partnerships and tenders",
        "Increases trust from customers and partners",
        "Avoids sanctions and legal issues",
      ],
      imageLabel: "Illustration of business license documents",
    },
    types: {
      title: "Types of Business Licenses We Handle",
      items: [
        { title: "Trading License / Business NIB", description: "Basic legality to run business activities." },
        { title: "Trading Business License (IUP)", description: "For import and export trading businesses." },
        { title: "Service Business License", description: "For businesses in the service sector." },
        { title: "Industrial Business License (IUI)", description: "For businesses in the industrial & manufacturing sector." },
        { title: "Tourism Business License", description: "For businesses in the tourism & hospitality sector." },
        { title: "Health Business License", description: "For clinics, pharmacies, laboratories, and health facilities." },
      ],
      linkLabel: "View All Types of Business Licenses",
    },
    process: {
      title: "Business License Processing Steps",
      steps: [
        { title: "Consultation", description: "Tell us about your business license needs." },
        { title: "Data Collection", description: "We will request the necessary data and documents." },
        { title: "Review & Verification", description: "Our team reviews and verifies the completeness of your data." },
        { title: "Submission to Authorities", description: "Documents are submitted to the relevant agency according to license type." },
        { title: "License Issued", description: "Your business license is issued and ready to use." },
      ],
    },
    packagesTitle: "Choose Your Business License Package",
    documents: {
      title: "Required Documents (General)",
      items: [
        "Responsible Person's ID Card (KTP)",
        "Company Tax ID (NPWP)",
        "Company Establishment Deed",
        "Company NIB",
        "Business Address",
        "Active Email & Phone Number",
      ],
    },
    duration: { value: "3 – 14 Business Days", note: "(depending on license type and data completeness)" },
    testimonialsHelp: { title: "Need Help Managing Your Business License?", description: "Consult your needs now, for FREE!" },
    faqsTitle: "FAQ About Business Licenses",
    cta: {
      title: "Complete Legality, Growing Business!",
      subtitle: "Entrust your business license processing to our professional team.",
    },
  },
};

export const CUSTOM_DETAIL_ZH: Record<string, ServiceDetailContentLang> = {
  "pendirian-pt": {
    kicker: "服务",
    tagline: "简便、快速、100%合法",
    heroDescription: "我们协助您根据法律法规,以快速、透明、安全的流程专业地设立PT有限公司。",
    highlights: [{ label: "快速高效的流程" }, { label: "100%合法正规" }, { label: "免费咨询" }, { label: "费用透明" }],
    stats: [{ value: "5,000+", label: "已协助企业数" }, { value: "99%", label: "客户满意度" }],
    about: {
      title: "什么是PT有限公司设立?",
      paragraphs: [
        "设立PT是设立具有国家正式法人地位的有限责任公司这一企业形式的法律程序。",
        "PT具有诸多优势,如法律保护、更高的商业信誉,以及便于企业发展。",
      ],
      imageLabel: "具有法人资格的公司大楼插图",
      badge: "合法可信",
    },
    benefits: {
      title: "设立PT的优势",
      items: [
        { title: "正式法人地位", description: "受国家法律承认与保护。" },
        { title: "高信誉度", description: "提升客户、合作伙伴与投资者的信任。" },
        { title: "更广泛的渠道", description: "便于获得融资、合作及项目招标机会。" },
        { title: "个人财产保护", description: "所有者个人财产与公司资产互不混同。" },
        { title: "易于扩展", description: "便于业务发展与开设分支机构。" },
      ],
    },
    process: {
      title: "PT设立流程",
      steps: [
        { title: "咨询", description: "就您的需求及企业类型进行咨询。" },
        { title: "资料收集", description: "我们将向您索取所需的资料与文件。" },
        { title: "契约制作", description: "由公证人制作PT设立契约书。" },
        { title: "核准", description: "办理法律部核准函(SK Kemenkumham)以取得法人资格。" },
        { title: "文件完成", description: "所有文件齐备,随时可交付。" },
      ],
    },
    packagesTitle: "选择您的PT设立套餐",
    documents: { title: "所需文件", items: ["董事及监事身份证(KTP)", "个人税号(NPWP)", "企业地址", "有效邮箱", "公司名称及经营范围"] },
    duration: { value: "3 – 7个工作日", note: "(视资料完整程度而定)" },
    testimonialsHelp: { title: "需要帮助?", description: "立即咨询您的PT设立需求!" },
    faqsTitle: "PT设立常见问题",
    cta: { title: "准备好设立您的PT了吗?", subtitle: "将您的PT设立交给我们的专业团队。" },
  },
  nib: {
    kicker: "NIB服务",
    tagline: "开启企业合法经营的第一步",
    heroDescription: "通过OSS(在线单一提交系统),轻松、快速、正式地获取NIB。",
    highlights: [{ label: "1-3个工作日快速办理" }, { label: "100%合法正规" }, { label: "免费咨询" }, { label: "费用透明" }],
    stats: [{ value: "5,000+", label: "已协助企业主数" }, { value: "99%", label: "客户满意度" }],
    about: {
      title: "什么是NIB?",
      paragraphs: ["NIB(企业识别号)是政府通过OSS系统颁发给经营者的正式身份标识。NIB是开展经营活动的基本合法凭证。"],
      checklist: [
        "经营者的正式身份标识",
        "办理许可及获取政府设施的主要条件",
        "可作为公司注册证(TDP)使用",
        "只要企业持续经营即长期有效",
      ],
      imageLabel: "NIB文件插图",
    },
    benefits: {
      title: "拥有NIB的好处",
      items: [
        { title: "正式合法性", description: "企业获得政府认可的合法地位。" },
        { title: "便于办理许可", description: "便于申请其他营业许可证。" },
        { title: "经营更便利", description: "提升消费者与合作伙伴的信任度。" },
        { title: "更广阔的机会", description: "可参与招标、合作及出口业务。" },
        { title: "政府扶持", description: "可获得政府补助及融资项目支持。" },
      ],
    },
    process: {
      title: "NIB办理流程",
      steps: [
        { title: "咨询", description: "告知我们您的企业需求。" },
        { title: "资料收集", description: "我们将向您索取所需的资料与文件。" },
        { title: "OSS提交申请", description: "通过OSS系统提交NIB申请。" },
        { title: "NIB颁发", description: "您的NIB已颁发,可随时使用。" },
        { title: "陪同服务", description: "我们协助确保流程顺利进行。" },
      ],
    },
    packagesTitle: "选择您的NIB套餐",
    documents: { title: "所需文件", items: ["负责人身份证(KTP)", "税号/NPWP(如有)", "企业地址", "有效邮箱", "经营范围/KBLI"] },
    duration: { value: "1-3个工作日", note: "(视资料完整程度而定)" },
    testimonialsHelp: { title: "需要帮助?", description: "我们的团队随时协助您快速便捷地获取NIB。" },
    faqsTitle: "NIB常见问题",
    cta: { title: "立即开启您的企业合法经营!", subtitle: "获取正式NIB,与我们一起提升您的商业机会。" },
  },
  "izin-usaha": {
    kicker: "营业许可服务",
    tagline: "完整合规,业务顺畅无忧",
    heroDescription: "我们协助您根据业务领域,快速、安全、可靠地获取各类营业许可证。",
    highlights: [{ label: "快速高效的流程" }, { label: "100%合法正规" }, { label: "经验丰富的专业团队" }, { label: "免费咨询" }],
    stats: [{ value: "2,000+", label: "已颁发营业许可证" }, { value: "98%", label: "客户满意度" }],
    about: {
      title: "什么是营业许可证?",
      paragraphs: ["营业许可证是由主管机关颁发的法律文件,作为您的经营活动已符合现行要求与规定的有效证明。"],
      checklist: [
        "政府认可的合法有效经营证明",
        "开拓合作与招标机会",
        "提升客户与合作伙伴的信任",
        "避免处罚与法律问题",
      ],
      imageLabel: "营业许可证文件插图",
    },
    types: {
      title: "我们办理的营业许可证类型",
      items: [
        { title: "贸易许可证/企业NIB", description: "开展经营活动的基本合法凭证。" },
        { title: "贸易营业许可证(IUP)", description: "适用于进出口贸易企业。" },
        { title: "服务业营业许可证", description: "适用于服务领域企业。" },
        { title: "工业营业许可证(IUI)", description: "适用于工业与制造业领域企业。" },
        { title: "旅游业营业许可证", description: "适用于旅游及酒店领域企业。" },
        { title: "卫生业营业许可证", description: "适用于诊所、药房、实验室及医疗机构。" },
      ],
      linkLabel: "查看所有营业许可证类型",
    },
    process: {
      title: "营业许可证办理流程",
      steps: [
        { title: "咨询", description: "告知我们您的营业许可证需求。" },
        { title: "资料收集", description: "我们将向您索取所需的资料与文件。" },
        { title: "审核与核实", description: "我们的团队将审核并核实您资料的完整性。" },
        { title: "向机构提交申请", description: "文件将根据许可证类型提交至相关机构。" },
        { title: "许可证颁发", description: "您的营业许可证已颁发,可随时使用。" },
      ],
    },
    packagesTitle: "选择您的营业许可证套餐",
    documents: {
      title: "所需文件(通用)",
      items: ["负责人身份证(KTP)", "公司税号(NPWP)", "公司设立契约", "公司NIB", "企业地址", "有效邮箱及电话号码"],
    },
    duration: { value: "3-14个工作日", note: "(视许可证类型及资料完整程度而定)" },
    testimonialsHelp: { title: "需要办理营业许可证的帮助吗?", description: "立即免费咨询您的需求!" },
    faqsTitle: "营业许可证常见问题",
    cta: { title: "完整合规,业务蒸蒸日上!", subtitle: "将您的营业许可证办理交给我们的专业团队。" },
  },
};

/** Ambil detailContentEn/Zh siap-simpan utk satu service — custom kalau ada
 * (3 slug hand-authored), generic template kalau enggak (15 sisanya). */
export function getDetailContentLang(
  slug: string,
  locale: "en" | "zh",
  title: string,
  checklist: string[],
): ServiceDetailContentLang {
  const custom = locale === "en" ? CUSTOM_DETAIL_EN[slug] : CUSTOM_DETAIL_ZH[slug];
  if (custom) return custom;
  return locale === "en" ? genericDetailEn(title, checklist) : genericDetailZh(title, checklist);
}
