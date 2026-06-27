"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { AdminSidebarProvider, useAdminSidebar } from "@/contexts/AdminSidebarContext";

const AUTH_PAGES = ["/admin/login", "/admin/register"];

/* ─── Inner layout (needs sidebar context) ─── */
function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { open, close } = useAdminSidebar();
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ─── Root admin layout with auth guard ─── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const isAuthPage = AUTH_PAGES.includes(pathname);

  useEffect(() => {
    if (isAuthPage) {
      setChecked(true);
      return;
    }
    const auth = sessionStorage.getItem("admin-auth");
    if (!auth) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [isAuthPage, pathname, router]);

  /* Auth pages: render clean (no sidebar) */
  if (isAuthPage) return <>{children}</>;

  /* Waiting for auth check */
  if (!checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="w-8 h-8 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <AdminSidebarProvider>
      <AdminPanelLayout>{children}</AdminPanelLayout>
    </AdminSidebarProvider>
  );
}
