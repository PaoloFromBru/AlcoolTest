import type { Metadata } from "next";
import { getDictionary } from "../../lib/dictionary";
import { Providers } from "../../components/Providers";
import { defaultLocale, isLocale, type Locale } from "../../i18n/config";
import "../globals.css";
import Link from "next/link";
import LocaleSwitcher from "../../components/LocaleSwitcher";

export const metadata: Metadata = {
  title: "AlcoolTest PWA",
  description: "PWA multi-lingua per calcolare una stima del BAC",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png"
  },
  themeColor: "#f59e0b"
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale: Locale = isLocale(params.locale) ? (params.locale as Locale) : defaultLocale;
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-neutral-950/60 border-b border-neutral-100 dark:border-neutral-900">
          <nav className="container flex items-center justify-between h-14">
            <Link href={`/${locale}`} className="font-semibold tracking-tight">🍺 AlcoolTest</Link>
            <div className="flex items-center gap-3">
              <Link href={`/${locale}/calc`} className="btn">{dict.nav.calculator}</Link>
              <LocaleSwitcher />
            </div>
          </nav>
        </header>
        <Providers locale={locale} dict={dict}>
          <main className="container py-8">{children}</main>
          <footer className="container py-10 text-sm text-neutral-500 space-y-1">
            <p>⚠️ {dict.footer.warn}</p>
            <p>{dict.footer.limit}</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
