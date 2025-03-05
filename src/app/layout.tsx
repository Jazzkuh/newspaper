import { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Newspaper",
  description: "A classic newspaper layout built with Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
