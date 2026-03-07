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
    ? 'CodeAtlas - AI coding navigation hub: tools, guides, templates, buying tips'
    : 'CodeAtlas - AI 编程导航站：工具对比、教程、模板与使用/购买指南';

  const description = isEn
    ? 'CodeAtlas is an AI coding navigation hub. Start from tasks, then navigate to tools, workflows, templates and buying options to build your AI-assisted development stack.'
    : 'CodeAtlas 是面向中文开发者的 AI 编程导航站，从任务出发导航到合适的工具、教程、模板和购买渠道，帮你搭建自己的 AI 编程工作流。';

  const keywords = isEn
    ? ['AI coding tools', 'AI coding navigation', 'Cursor', 'GitHub Copilot', 'Claude Code', 'code completion', 'tool comparison']
    : ['AI编程工具', 'AI 编程导航', 'AI 编程导航站', 'Cursor', 'GitHub Copilot', 'Claude Code', '代码补全', 'AI编程对比'];

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
