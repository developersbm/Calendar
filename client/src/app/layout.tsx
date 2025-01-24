import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import AuthPage from "./auth/page";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PLAN IT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardWrapper>{children}</DashboardWrapper>
        <AuthPage>{children}</AuthPage>
      </body>
    </html>
  );
}
