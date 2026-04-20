import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import type { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { QueryProvider } from '@/providers/QueryProvider';
import { ConfigProvider } from '@/providers/ConfigProvider';
import { Header } from '@/components/layout/Header';
import { QASheet } from '@/components/qa/QASheet';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { routing } from '@/i18n/routing';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '桥知 BridgingChina · 古桥文化知识库',
  description: '中国古代桥梁知识图谱、地图、问答',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <ConfigProvider>
              <Header />
              <main className="container mx-auto px-4 py-6">
                <ErrorBoundary>{children}</ErrorBoundary>
              </main>
              <QASheet />
            </ConfigProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
