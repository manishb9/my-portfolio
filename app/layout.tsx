import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infosys Stock Chart",
  description: "Daily EOD stock chart for Infosys",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
