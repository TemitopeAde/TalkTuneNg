import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import PageTransitionLayout from "@/components/PageTransitionLayout";
import { SessionProvider } from "@/providers/SessionProvider";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "300", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "TalkTuneNg - AI-Powered Voiceover Platform",
  description: "Effortlessly Create and Elevate Your Audio Projects with Our AI-powered Voiceovers",
  keywords: ["AI voiceover", "text to speech", "audio creation", "voice generation", "TalkTuneNg", "AI audio", "voiceover platform"],
  publisher: "TalkTuneNg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.className} antialiased`}>
        <Toaster position="top-center" toastOptions={{
          className: "bg-green-500",
          style: {
            backgroundColor: "#3F4B65",
            color: "#fff",
            border: "1px solid #8cbe41"
          }
        }} />
        <SessionProvider>
          <QueryProvider>
            <PageTransitionLayout>
              {children}
            </PageTransitionLayout>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
