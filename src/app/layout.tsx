import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://medtracker-zerx.vercel.app"),
  title: "MedTracker — A med tracker to know your meds",
  description:
      "Search the FDA database, track your daily doses, and get warned when your medications interact. All in one place.",
  openGraph: {
    title: "MedTracker",
    description:
        "A med tracker that pulls FDA label data and detects interactions between your medications.",
    url: "https://medtracker-zerx.vercel.app",
    siteName: "MedTracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MedTracker",
    description:
        "A med tracker that pulls FDA label data and detects interactions between your medications.",
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
      <body className="min-h-full flex flex-col">
      {children}
      <Analytics />
      </body>
      </html>
  );
}