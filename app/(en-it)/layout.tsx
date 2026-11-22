// /en/it root layout — <html lang="it">
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import ClarityScript from "@/lib/ui/ClarityScript";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL("https://bdimexport.com") };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("en", "it")}>
      <head>
        <ThemeStyle />
        <ClarityScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
