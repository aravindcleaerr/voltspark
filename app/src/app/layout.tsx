import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unnathi CNC - ZED Energy Management",
  description: "ZED Certification Energy Management Compliance Suite for Unnathi CNC Technologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
