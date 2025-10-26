import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { ToastProvider } from '@/components/notifications/ToastProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AgentFlow - Complete AI Agent Platform",
  description: "Build powerful, autonomous AI agents with custom dashboards, RAG knowledge bases, and seamless app integrations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={inter.className}>
          <ErrorBoundary>
            {children}
            <ToastProvider />
          </ErrorBoundary>
        </body>
      </UserProvider>
    </html>
  );
}
