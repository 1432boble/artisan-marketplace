import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://artisan-marketplace-phi.vercel.app"),
  title: "Biso",
  description: "La communauté des pros de confiance près de chez vous.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Biso",
    description: "La communauté des pros de confiance près de chez vous.",
    type: "website",
    locale: "fr_FR",
    siteName: "Biso",
  },
  twitter: {
    card: "summary_large_image",
    title: "Biso",
    description: "La communauté des pros de confiance près de chez vous.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#B03A1A" />
      </head>
      <body className="min-h-full flex flex-col">
  {children}

  <script
    dangerouslySetInnerHTML={{
      __html: `
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js');
          });
        }
      `,
    }}
  />
</body>
    </html>
  );
}
