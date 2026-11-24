import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Boogaloo, IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const space = Space_Grotesk({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-space" });
const plex = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-plex" });
const boogaloo = Boogaloo({ weight: "400", subsets: ["latin"], variable: "--font-boogaloo" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://warehouseswing.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Warehouse Swing | Modern swing every Tuesday in Wixom, MI",
    template: "%s | Warehouse Swing",
  },
  description:
    "Modern swing lessons and social dancing every Tuesday, 7 to 10 PM, in Wixom, Michigan. No partner needed, no experience required.",
  openGraph: {
    siteName: "Warehouse Swing",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 675, alt: "Warehouse Swing" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#101114",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bebas.variable} ${space.variable} ${plex.variable} ${boogaloo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink">{children}</body>
    </html>
  );
}
