// app/layout.tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { FlightProvider } from "./context/FlightContext";
import Header from "./_components/Header";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: "ExitFlight Ticket Generator",
  description:
    "Create realistic mock flight tickets for presentations and fun.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <FlightProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </FlightProvider>
      </body>
    </html>
  );
}
