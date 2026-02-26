import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function DashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRole="job_seeker">
      {children}
    </RoleGuard>
  );
}
