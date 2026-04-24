import "./globals.css";

import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Libre_Baskerville,
  Raleway
} from "next/font/google";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap"
});

const subheading = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-subheading",
  display: "swap"
});

const body = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "The Maury River Mushroom Farm",
    template: "%s | The Maury River Mushroom Farm"
  },
  description:
    "Fresh gourmet mushrooms, pantry products, recipes, pickup information, and restaurant inquiries from The Maury River Mushroom Farm."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${subheading.variable} ${body.variable}`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
