/* ─── Tipe Data Global IzinPro CMS ─── */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  features: string[];
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  initials: string;
  avatarColor: string;
}

export interface VideoTestimonialItem {
  id: string;
  name: string;
  role: string;
  duration: string;
  gradient: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  views: string;
  gradient: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface PromoItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
}

export interface ClientItem {
  name: string;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TeamMember {
  name: string;
  role: string;
  initials: string;
  gradient: string;
}

/* ─── Admin Types ─── */
export interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: string;
  color: string;
  bgColor: string;
}
