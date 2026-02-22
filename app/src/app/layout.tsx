import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoltSpark - Energy Management",
  description: "Energy Management Compliance Suite by VoltSpark",
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
