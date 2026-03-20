import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/Provider";
import Navbar from "@/components/Navbar";
import { NotificationProvider } from "@/components/NotificationProvider";

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
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <NotificationProvider>
            <Navbar />
            <main className="pt-24 min-h-screen">
              {children}
            </main>
          </NotificationProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
