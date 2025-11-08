import type { Metadata } from "next";
import { fredoka, leagueSpartan } from "@/lib/fonts";
import MainLayout from "@/components/layout/MainLayout";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equality Vanguard",
  description: "Pan-African feminist collective dismantling oppression through law, art, and radical community",
  icons: {
    icon: [
      { url: "/images/EV ROUND LOGO.png", sizes: "16x16", type: "image/png" },
      { url: "/images/EV ROUND LOGO.png", sizes: "32x32", type: "image/png" },
      { url: "/images/EV ROUND LOGO.png", sizes: "192x192", type: "image/png" },
      { url: "/images/EV ROUND LOGO.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/images/EV ROUND LOGO.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/images/EV ROUND LOGO.png", sizes: "180x180", type: "image/png" }],
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
