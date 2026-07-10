"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";
import { NAV_LINKS, WHATSAPP_URL } from "@/lib/landing";
import { cn } from "@/lib/utils";

/* ─── Navbar Utama ─── */
export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);

  /* Tutup mobile menu saat navigasi — reset state saat render, bukan effect */
  const [lastPathname, setLastPathname] = useState(pathname);
  if (lastPathname !== pathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
    setMobileDropdown(null);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/images/izinpro-logo.png"
            alt="IzinPro"
            width={132}
            height={28}
            priority
            className="h-7 w-auto dark:brightness-0 dark:invert"
          />
        </Link>

        {/* Menu desktop */}
        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.children ? (
                <li key={link.label}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        "group inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium outline-none transition-colors hover:text-primary",
                        "data-popup-open:border-primary/50 data-popup-open:bg-primary/5 data-popup-open:text-primary",
                        isActive(link.href)
                          ? "border-primary/50 bg-primary/5 font-semibold text-primary"
                          : "border-transparent text-foreground/80",
                      )}
                    >
                      {link.label}
                      <ChevronDown
                        className="size-4 transition-transform group-data-popup-open:rotate-180"
                        aria-hidden="true"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      sideOffset={12}
                      className="w-72 rounded-2xl border-none p-3 shadow-xl ring-1 ring-foreground/5"
                    >
                      {link.children.map((child) => (
                        <DropdownMenuItem
                          key={child.label}
                          render={<Link href={child.href} />}
                          className="gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/80"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-primary/60"
                            aria-hidden="true"
                          />
                          {child.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ) : (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary",
                      isActive(link.href) && !link.href.includes("#")
                        ? "font-semibold text-primary underline decoration-2 underline-offset-8"
                        : "text-foreground/80",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        {/* CTA desktop */}
        <div className="hidden lg:block">
          <Button asChild className="rounded-full font-semibold">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              Konsultasikan Gratis
              <WhatsAppIcon className="size-4" />
            </a>
          </Button>
        </div>

        {/* Menu mobile */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Buka menu navigasi"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <nav aria-label="Navigasi mobile" className="px-4">
              <ul className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) =>
                  link.children ? (
                    /* Item dengan sub-menu — dropdown buka/tutup */
                    <li key={link.label}>
                      <button
                        type="button"
                        aria-expanded={mobileDropdown === link.label}
                        onClick={() =>
                          setMobileDropdown(
                            mobileDropdown === link.label ? null : link.label,
                          )
                        }
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          mobileDropdown === link.label
                            ? "bg-primary/5 text-primary"
                            : "text-foreground/90 hover:bg-accent hover:text-primary",
                        )}
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "size-4 transition-transform",
                            mobileDropdown === link.label && "rotate-180",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                      {mobileDropdown === link.label && (
                        <ul className="ml-4 mt-1 border-l border-border pl-4">
                          {link.children.map((child) => (
                            <li key={child.label}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-md px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ) : (
                    /* Item link biasa — pill outline saat halaman aktif */
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "block rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          isActive(link.href)
                            ? "border border-primary/50 text-foreground"
                            : "text-foreground/90 hover:bg-accent hover:text-primary",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
              <Separator className="my-4" />
              <Button asChild className="w-full rounded-full font-semibold">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Konsultasikan Gratis
                  <WhatsAppIcon className="size-4" />
                </a>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
