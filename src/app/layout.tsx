import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: "Оргтехника Каталог",
  description: "Каталог оргтехники с актуальными ценами",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body
        className={`${inter.className} antialiased bg-[var(--tg-theme-secondary-bg-color)] min-h-screen pb-20`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
