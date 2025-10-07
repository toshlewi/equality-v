import type { Metadata } from "next";
import { fredoka, leagueSpartan } from "@/lib/fonts";
import MainLayout from "@/components/layout/MainLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equality Vanguard",
  description: "Pan-African feminist collective dismantling oppression through law, art, and radical community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fredoka.variable} ${leagueSpartan.variable} antialiased`}
      >
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
