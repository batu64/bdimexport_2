// /en/ro root layout — <html lang="ro">
import "@/app/globals.css";
import ThemeStyle, { htmlAttrs } from "@/lib/ui/ThemeStyle";
import type { Metadata } from "next";

export const metadata: Metadata = { metadataBase: new URL("https://bdimexport.com") };

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html {...htmlAttrs("en", "ro")}>
      <head>
        <ThemeStyle />
      </head>
      <body>{children}</body>
    </html>
  );
}
