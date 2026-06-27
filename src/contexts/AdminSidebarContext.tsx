"use client";

import { createContext, useContext, useState } from "react";

interface SidebarCtx {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const AdminSidebarContext = createContext<SidebarCtx>({
  open: false,
  toggle: () => {},
  close: () => {},
});

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AdminSidebarContext.Provider
      value={{ open, toggle: () => setOpen((v) => !v), close: () => setOpen(false) }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export const useAdminSidebar = () => useContext(AdminSidebarContext);
