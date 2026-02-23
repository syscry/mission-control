import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { APP_META } from "@/lib/constants";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space"
});

const ibmMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-mono"
});

export const metadata: Metadata = {
  title: APP_META.name,
  description: APP_META.description
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${ibmMono.variable} font-[var(--font-space)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
