import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "GrenadierParts.com",
  description: "Accessories, parts & resources for the Ineos Grenadier."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en" className={inter.className}>
      <body>
        <header className="site-header">
          <div className="container">
            <a href="/" className="brand" aria-label="GrenadierParts.com Home">
              <h1 className="brand-title" style={{ margin: 0 }}>GrenadierParts.com</h1>
            </a>
            <p className="brand-sub">Guides, gear, and parts for the Ineos Grenadier.</p>
          </div>
        </header>

        <main className="container">
          {children}
        </main>

        <footer className="site-footer">
          <div className="container">
            <p>
              © {new Date().getFullYear()} GrenadierParts.com •{" "}
              <a href="/disclosure">Disclosure</a> •{" "}
              <a href="/privacy">Privacy</a>
            </p>
          </div>
        </footer>

        {/* GA4 */}
        {GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
                `
              }}
            />
          </>
        )}

        {/* Google AdSense (global) — replace with your real pub id if not already set */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8299388815722920"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
