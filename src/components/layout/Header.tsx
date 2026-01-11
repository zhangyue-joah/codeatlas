'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from '@/components/layout/GlobalSearch';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import { useT } from '@/i18n/client';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useT();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center gap-8">
          <HeaderBrand />
          <HeaderDesktopNav
            pathname={pathname}
            items={[
              { href: '/use', label: t('nav.getStarted') },
              { href: '/tools', label: t('nav.products') },
              { href: '/tutorials', label: t('nav.tutorials') },
              { href: '/templates', label: t('nav.rules') },
              { href: '/buy', label: t('nav.buy') },
            ]}
          />
        </div>

        <div className="flex items-center gap-3">
          <GlobalSearch variant="icon" ariaLabel={t('header.search')} />
          <ThemeToggle toLightLabel={t('theme.toLight')} toDarkLabel={t('theme.toDark')} />
          <LanguageToggle language={language} onToggle={toggleLanguage} />

          <HeaderMobileMenuButton
            ariaLabel={t('header.openMenu')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          />
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <HeaderMobileMenu
          pathname={pathname}
          items={[
            { href: '/use', label: t('nav.getStarted') },
            { href: '/tools', label: t('nav.products') },
            { href: '/tutorials', label: t('nav.tutorials') },
            { href: '/templates', label: t('nav.rules') },
            { href: '/buy', label: t('nav.buy') },
          ]}
          onNavigate={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
}

function HeaderBrand() {
  return (
    <div className="flex">
      <Link href="/" className="-m-1.5 p-1.5">
        <span className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">CodeAtlas</span>
      </Link>
    </div>
  );
}

function isActiveRoute(pathname: string, href: string) {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderMobileMenuButton({ onClick, ariaLabel }: { onClick: () => void; ariaLabel: string }) {
  return (
    <div className="flex lg:hidden">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={onClick}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <span className="sr-only">{ariaLabel}</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </div>
  );
}

function HeaderDesktopNav({ items, pathname }: { items: { href: string; label: string }[]; pathname: string }) {
  return (
    <div className="hidden lg:flex lg:items-center lg:gap-x-8">
      {items.map((item) => {
        const isActive = isActiveRoute(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'text-sm font-semibold text-foreground'
                : 'text-sm font-medium text-foreground/70 transition-colors hover:text-foreground'
            }
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function HeaderMobileMenu({
  items,
  onNavigate,
  pathname,
}: {
  items: { href: string; label: string }[];
  onNavigate: () => void;
  pathname: string;
}) {
  return (
    <div className="lg:hidden">
      <div className="space-y-3 px-4 pb-4 pt-3">
        {items.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={
                isActive
                  ? 'block rounded-md bg-accent px-3 py-2 text-base font-semibold text-accent-foreground'
                  : 'block rounded-md px-3 py-2 text-base font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
