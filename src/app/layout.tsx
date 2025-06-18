import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers/NextAuthProvider";
import HeaderWrapper from "./components/HeaderWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CUSS Purwakarta",
  description: "CUSS Purwakarta - Your Trusted Partner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${inter.variable} font-sans antialiased bg-white text-black relative vsc-initialized`}
      >
        <NextAuthProvider>
          <HeaderWrapper />
          {/* Main Content */}
          <main className="min-h-[80vh] bg-white">{children}</main>

          {/* Footer */}
          <footer className="bg-black text-white text-center py-4 mt-8">
            <span className="text-sm">&copy; {new Date().getFullYear()} CUSS Purwakarta. All rights reserved.</span>
          </footer>

          {/* Floating WhatsApp CTA (mobile) */}
          <a
            href="https://wa.me/6287858860846?text=Yuk%20CUSS%20sekarang!%20Saya%20mau%20pesan%20layanan."
            target="_blank"
            rel="noopener noreferrer"
            className="fixed z-40 bottom-6 right-6 md:hidden bg-orange-500 text-white rounded-full shadow-lg px-6 py-3 font-bold text-lg flex items-center gap-2 animate-bounce hover:bg-orange-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 5.385 4.365 9.75 9.75 9.75 1.7 0 3.29-.425 4.68-1.17l3.82 1.02-1.02-3.82A9.708 9.708 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12z" />
            </svg>
            Hubungi CS Kami
          </a>
        </NextAuthProvider>
      </body>
    </html>
  );
}
