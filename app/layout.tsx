import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AlcoolTest",
  description: "Calcolatore tasso alcolemico",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png" },
      { url: "/icons/icon-512x512.png" }
    ],
    apple: [
      { url: "/icons/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/icons/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/icons/apple-icon-167x167.png", sizes: "167x167" },
      { url: "/icons/apple-icon-180x180.png", sizes: "180x180" },
      { url: "/icons/apple-icon-1024x1024.png", sizes: "1024x1024" }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head />
      <body>{children}</body>
    </html>
  );
}
