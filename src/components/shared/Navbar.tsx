"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, COMPANY_INFO } from "@/lib/constants";
import { Button } from "@/components/ui/button";

/* ─── Logo IzinPro ─── */
function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white shadow-sm">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M15 4.5L7 13.5L3 9"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-gray-900">{COMPANY_INFO.name}</span>
    </Link>
  );
}

/* ─── Navbar Utama ─── */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Tutup mobile menu saat navigasi */
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-white/80 backdrop-blur-sm",
        )}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-18">
            <Logo />

            {/* ─── Navigasi Desktop ─── */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "text-primary bg-primary/8"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={14}
                        className={cn(
                          "transition-transform",
                          openDropdown === item.label && "rotate-180",
                        )}
                      />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && openDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-2 w-64 z-50">
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ─── CTA Desktop ─── */}
            <div className="hidden lg:flex items-center gap-3">
              <Button asChild size="sm" className="gap-2 rounded-xl shadow-sm shadow-primary/20">
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={15} />
                  Konsultasikan Gratis
                </a>
              </Button>
            </div>

            {/* ─── Tombol Hamburger Mobile ─── */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Menu ─── */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300",
          mobileOpen ? "visible" : "invisible",
        )}
      >
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-72 bg-white shadow-2xl transition-transform duration-300 flex flex-col",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Logo />
            <button
              className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        setMobileDropdown(mobileDropdown === item.label ? null : item.label)
                      }
                    >
                      {item.label}
                      <ChevronDown
                        size={15}
                        className={cn(
                          "transition-transform",
                          mobileDropdown === item.label && "rotate-180",
                        )}
                      />
                    </button>
                    {mobileDropdown === item.label && (
                      <div className="pl-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "text-primary bg-primary/8"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <Button asChild className="w-full gap-2 rounded-xl">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={16} />
                Konsultasikan Gratis
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer agar konten tidak tertutup navbar */}
      <div className="h-16 md:h-18" />
    </>
  );
}
