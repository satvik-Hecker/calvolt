import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/store/AuthContext";
import { CalendarProvider } from "@/store/CalendarContext";
import EventModal from "@/components/EventModal";
import EventDetailPopover from "@/components/EventDetailPopover";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CalVolt",
  description:
    "A high-fidelity Google Calendar clone with event creation, drag-and-drop, recurring events, and smooth interactions. Built with Next.js and Express.",
  keywords: ["calendar", "scheduling", "events", "google calendar clone"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", inter.variable)}>
      <body className="min-h-full flex flex-col font-mono">
        <AuthProvider>
          <CalendarProvider>
            {children}
            <EventModal />
            <EventDetailPopover />
          </CalendarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
