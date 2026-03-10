import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kennion CRM",
  description: "Personal CRM for managing contacts and leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
