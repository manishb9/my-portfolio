import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  description: "Dynamic algorithmic nested investment tracking timeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#87ceeb', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
