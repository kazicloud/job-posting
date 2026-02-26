"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardTopNav } from "./top-nav";

interface DashboardLayoutProps {
  children: ReactNode;
}

const SidebarContext = createContext<{
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <Sidebar />
      <div className={`min-h-screen bg-neutral-bg-secondary transition-all duration-200 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <DashboardTopNav />
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
