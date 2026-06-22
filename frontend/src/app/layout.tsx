import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Safal-AI | Single AI Platform for Everything",
  description:
    "Safal-AI is a single AI platform to connect AI models, integrate SafalVir applications, upload files, and complete tasks through simple prompts. Automate work with Safal Tokens.",
  keywords: [
    "AI automation platform",
    "AI model integration",
    "prompt-based automation",
    "AI workflow platform",
    "connect AI models",
    "Safal Tokens",
    "SafalVir AI",
    "ChatGPT Claude Gemini integration",
  ],
  openGraph: {
    title: "Safal-AI | Single AI Platform for Everything",
    description:
      "Connect AI models, integrate applications, upload files, and complete tasks through simple prompts — all inside Safal-AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
