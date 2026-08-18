import type { Metadata, Viewport } from "next";
import "./globals.css";
import { MusicProvider } from "@/lib/music-context";
import { GlobalMusicEngine } from "@/components/GlobalMusicEngine";

export const metadata: Metadata = {
  title: "KRUSHANTA.dev — AI Engineer & Creative Technologist",
  description:
    "Portfolio of Krushanta — AI Engineer specializing in Machine Learning, Computer Vision, Systems Architecture, and Interactive WebGL Experiences.",
  keywords: ["AI Engineer", "Machine Learning", "WebGL", "Three.js", "Next.js", "Creative Technology"],
  authors: [{ name: "Krushanta" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="bg-[#000000] text-[#FFFFFF]"
    >
      <body className="min-h-screen bg-[#000000] text-[#FFFFFF] antialiased selection:bg-[#FFFFFF] selection:text-[#000000]">
        <MusicProvider>
          {children}
          <GlobalMusicEngine />
        </MusicProvider>
      </body>
    </html>
  );
}
