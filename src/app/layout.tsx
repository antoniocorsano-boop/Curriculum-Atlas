import type { Metadata, Viewport } from "next";
import "@xyflow/react/dist/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas · Il curricolo, connesso",
  description: "Atlante integrale del curricolo dell'ecosistema TRAMA.",
};

export const viewport: Viewport = {
  themeColor: "#0b1d36",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
