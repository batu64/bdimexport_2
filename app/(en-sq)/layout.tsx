// /en/sq root layout — <html lang="sq">
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL("https://bdimexport.com") };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("en", "sq")}>
      <head>
        <ThemeStyle />
      </head>
      <body>{children}</body>
    </html>
  );
}
