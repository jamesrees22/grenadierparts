import "./globals.css";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "GrenadierParts.com",
  description: "Guides, gear & parts for the Ineos Grenadier",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header style={{ padding: "20px 0" }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <a href="/" style={{ fontSize: 28, fontWeight: 800, color: "var(--brand)" }}>
              GrenadierParts.com
            </a>
            <nav style={{ display: "flex", gap: 18 }}>
              <a href="/" className="link">Home</a>
              <a href="/category/accessories" className="link">Accessories</a>
              <a href="/category/maintenance" className="link">Maintenance</a>
              <a href="/news" className="link">News</a>
              <a href="/disclosure" className="link">Disclosure</a>
            </nav>
          </div>
        </header>

        <main className="container" style={{ paddingBottom: 40 }}>{children}</main>

        <footer className="container" style={{ padding: "24px 0", opacity: 0.9 }}>
          <small>
            © {new Date().getFullYear()} GrenadierParts.com •{" "}
            <a href="/disclosure">Disclosure</a> • <a href="/privacy">Privacy</a>
          </small>
        </footer>
      </body>
    </html>
  );
}
