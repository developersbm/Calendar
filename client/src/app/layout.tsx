import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./rootLayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CALENDAR",
  icons: {
    icon: "/mainLogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}
