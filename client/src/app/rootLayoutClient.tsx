"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DashboardWrapper from "./dashboardWrapper";
import AuthPage from "./auth/page";

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/auth") {
    return <AuthPage />;
  }

  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
}
