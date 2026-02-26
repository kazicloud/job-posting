"use client";

import { ReactNode, createContext, useContext, useState } from "react";
import { EmployerSidebar } from "./employer-sidebar";
import { EmployerTopNav } from "./employer-top-nav";

interface EmployerDashboardLayoutProps {
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

export function EmployerDashboardLayout({ children }: EmployerDashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      <EmployerSidebar />
      <div className={`min-h-screen bg-neutral-bg-secondary transition-all duration-200 ${collapsed ? "lg:pl-16" : "lg:pl-64"}`}>
        <EmployerTopNav />
        {children}
      </div>
    </SidebarContext.Provider>
  );
}
