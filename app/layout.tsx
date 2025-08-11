export const metadata = {
  title: "AlcoolTest PWA",
  description: "Calcola una stima del tasso alcolemico con una PWA offline-first",
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png"
  }
};

import "./globals.css";
import PWARegister from "./pwa-register";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        <PWARegister />
        <header className="sticky top-0 z-50 backdrop-blur bg-white/70 dark:bg-neutral-950/60 border-b border-neutral-100 dark:border-neutral-900">
          <nav className="container flex items-center justify-between h-14">
            <Link href="/" className="font-semibold tracking-tight">🍺 AlcoolTest</Link>
            <div className="flex items-center gap-3">
              <Link href="/calc" className="btn">Calcolatore</Link>
            </div>
          </nav>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="container py-10 text-sm text-neutral-500 space-y-1">
          <p>⚠️ Stima indicativa, non usare per decidere se guidare.</p>
          <p>Limite generale in Italia: 0,5 g/L. <strong>Per neopatentati il limite è 0 g/L (tolleranza zero).</strong></p>
        </footer>
      </body>
    </html>
  );
}
