import "./globals.css";
import type { Metadata } from "next";
import React from "react";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "GrenadierParts.com",
  description: "Guides, gear & parts for the Ineos Grenadier",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <a href="/" className="site-logo">GrenadierParts.com</a>
            <Nav />
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
