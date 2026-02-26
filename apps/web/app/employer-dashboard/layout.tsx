import { ReactNode } from "react";
import { RoleGuard } from "@/components/auth/role-guard";

export default function EmployerDashboardRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRole="employer">
      {children}
    </RoleGuard>
  );
}
