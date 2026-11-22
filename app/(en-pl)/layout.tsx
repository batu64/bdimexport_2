// /en/pl root layout — <html lang="pl">
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import ClarityScript from "@/lib/ui/ClarityScript";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL("https://bdimexport.com") };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("en", "pl")}>
      <head>
        <ThemeStyle />
        <ClarityScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
