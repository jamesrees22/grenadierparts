export const metadata = {
  title: "GrenadierParts.com",
  description: "Accessories, parts & resources for the Ineos Grenadier."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="en">
      <body style={{ maxWidth: 840, margin: "0 auto", padding: 20, lineHeight: 1.6 }}>
        <header style={{ padding: "16px 0" }}>
          <a href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h1 style={{ margin: 0 }}>GrenadierParts.com</h1>
          </a>
          <p style={{ marginTop: 6, opacity: 0.75 }}>
            Guides, gear, and parts for the Ineos Grenadier.
          </p>
        </header>
        <main>{children}</main>
        <footer style={{ marginTop: 48, fontSize: 14, opacity: 0.8 }}>
          <p>© {new Date().getFullYear()} GrenadierParts.com • <a href="/disclosure">Disclosure</a> • <a href="/privacy">Privacy</a></p>
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
      </body>
    </html>
  );
}
