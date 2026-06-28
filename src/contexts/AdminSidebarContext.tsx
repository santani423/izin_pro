"use client";

import { createContext, useContext, useState } from "react";

interface SidebarCtx {
  open: boolean;
  toggle: () => void;
  close: () => void;
  collapsed: boolean;
  toggleCollapse: () => void;
}

const AdminSidebarContext = createContext<SidebarCtx>({
  open: false,
  toggle: () => {},
  close: () => {},
  collapsed: false,
  toggleCollapse: () => {},
});

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AdminSidebarContext.Provider
      value={{
        open,
        toggle: () => setOpen((v) => !v),
        close: () => setOpen(false),
        collapsed,
        toggleCollapse: () => setCollapsed((v) => !v),
      }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}

export const useAdminSidebar = () => useContext(AdminSidebarContext);
