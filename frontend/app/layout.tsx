import type { Metadata } from "next";
import { ReactNode } from "react";

import "./globals.css";

import { Providers } from "@/components/Providers";

const siteDescription =
  "Generate zero-storage proofs of existence on the Sui blockchain and keep full custody of your documents.";

export const metadata: Metadata = {
  title: {
    default: "SuiProof | Verifiable documents, stored nowhere",
    template: "%s | SuiProof",
  },
  description: siteDescription,
  applicationName: "SuiProof",
  keywords: [
    "SuiProof",
    "Sui",
    "document verification",
    "zero-knowledge",
    "hashing",
    "web3",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  twitter: {
    card: "summary_large_image",
    title: "SuiProof",
    description: siteDescription,
  },
  openGraph: {
    type: "website",
    title: "SuiProof | Verifiable documents, stored nowhere",
    description: siteDescription,
    siteName: "SuiProof",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}