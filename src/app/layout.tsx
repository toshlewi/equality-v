import type { Metadata } from "next";
import { fredoka, leagueSpartan } from "@/lib/fonts";
import MainLayout from "@/components/layout/MainLayout";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equality Vanguard",
  description: "Pan-African feminist collective dismantling oppression through law, art, and radical community",
  icons: {
    icon: "/images/EV ROUND LOGO.png",
    shortcut: "/images/EV ROUND LOGO.png",
    apple: "/images/EV ROUND LOGO.png",
  },
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
        <SessionProvider>
          <MainLayout>{children}</MainLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
