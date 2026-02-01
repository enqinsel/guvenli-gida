import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Güvenli Gıda | T.C. Gıda İfşa Takip Sistemi",
  description: "T.C. Tarım ve Orman Bakanlığı gıda güvenliği ifşa listelerini takip edin. Sağlık riski taşıyan ve taklit/tağşiş ürünleri anlık olarak görüntüleyin.",
  keywords: "gıda güvenliği, ifşa listesi, taklit ürün, tağşiş, sağlık riski, tarım bakanlığı",
  authors: [{ name: "Güvenli Gıda" }],
  openGraph: {
    title: "Güvenli Gıda | Gıda İfşa Listesi",
    description: "Bakanlık tarafından ifşa edilen gıda ürünlerini takip edin",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
