import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import the AuthProvider we created
import { AuthProvider } from "@/context/AuthContext";

//existing font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update Meta Data
export const metadata: Metadata = {
  title: "Student Management System",
  description: "Full-stack SMS built with Next.js and Spring Boot",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎓</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply fonts and base background color */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        {/* 4. Wrap everything in AuthProvider so login state works globally */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}