import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";
import { Providers } from "./providers";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "SIMRS",
  description: "SIMRS frontend"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

