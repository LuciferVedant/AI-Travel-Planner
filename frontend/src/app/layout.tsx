import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/Provider";
import Navbar from "@/components/Navbar";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trao AI - Intelligent Travel Planner",
  description: "Plan your next adventure with AI-driven itineraries",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ReduxProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <NotificationProvider>
              <Navbar />
              <main className="pt-24 min-h-screen">
                {children}
              </main>
            </NotificationProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
