import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ConfigProvider } from '@/providers/ConfigProvider';
import { Header } from '@/components/layout/Header';
import { QASheet } from '@/components/qa/QASheet';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '筑脉 ArchTrail · 古桥文化知识库',
  description: '中国古代桥梁知识图谱、地图、问答',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <QueryProvider>
          <ConfigProvider>
            <Header />
            <main className="container mx-auto px-4 py-6">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <QASheet />
          </ConfigProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
