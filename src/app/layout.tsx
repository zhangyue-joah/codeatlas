import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { getRequestLanguage } from '@/i18n/server';
import { LanguageProvider } from '@/components/layout/LanguageProvider';
import { siteConfig } from '@/config/site';

export function generateMetadata(): Metadata {
  const language = getRequestLanguage();
  const isEn = language === 'en';

  const titleDefault = isEn
    ? 'CodeAtlas - AI coding tools: comparisons, guides, buying tips'
    : 'CodeAtlas - AI 编程工具对比、教程与使用/购买指南';

  const description = isEn
    ? 'Choose the right AI coding tool and workflow. CodeAtlas maps: pick tools → apply capabilities → run SOPs → buy wisely.'
    : '选对 AI 编程工具，用对工作流。CodeAtlas 是一张从「选工具 → 用能力 → 跑工作流 → 合理购买」的 AI 编程地图。';

  const keywords = isEn
    ? ['AI coding tools', 'Cursor', 'GitHub Copilot', 'Claude Code', 'code completion', 'tool comparison']
    : ['AI编程工具', 'Cursor', 'GitHub Copilot', 'Claude Code', '代码补全', 'AI编程对比'];

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: titleDefault,
      template: '%s | CodeAtlas',
    },
    description,
    keywords,
    authors: [{ name: 'CodeAtlas' }],
    openGraph: {
      type: 'website',
      locale: isEn ? 'en_US' : 'zh_CN',
      url: siteConfig.url,
      siteName: siteConfig.name,
      title: titleDefault,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: titleDefault,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const language = getRequestLanguage();
  const htmlLang = language === 'en' ? 'en' : 'zh-CN';

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider initialLanguage={language}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
