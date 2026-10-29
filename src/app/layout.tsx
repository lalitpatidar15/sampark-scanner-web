import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ReduxProvider } from "@/store/Provider";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sampark — Contact the owner",
  description: "Privacy-preserving contact platform. Scan the QR code to reach the owner without revealing personal information.",
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Suspense } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <AuthProvider>
          <ReduxProvider>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>}>
              {children}
            </Suspense>
          </ReduxProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
