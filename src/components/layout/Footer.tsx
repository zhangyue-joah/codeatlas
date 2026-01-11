import Link from 'next/link';
import { tServer } from '@/i18n/server';

const FOOTER_NAVIGATION = {
  main: [
    { nameKey: 'nav.products', href: '/tools' },
    { nameKey: 'nav.tutorials', href: '/tutorials' },
    { nameKey: 'nav.rules', href: '/templates' },
  ],
  support: [
    { nameKey: 'footer.help.getStarted', href: '/use' },
    { nameKey: 'footer.help.buy', href: '/buy' },
  ],
  feedback: [
    { nameKey: 'footer.feedback.email', href: 'mailto:zhangyue.joah@icloud.com', label: 'zhangyue.joah@icloud.com' },
  ],
};

type TFooterNavItem = {
  nameKey: string;
  href: string;
};

/**
 * 全站 Footer：使用与首页一致的“弱底色 + 弱边界（ring）+ 圆角面板”语言，
 * 让信息区块（内容/帮助/声明）在视觉上更统一、且不抢主内容注意力。
 */
export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-muted/10 p-8 ring-1 ring-border/35 sm:p-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <FooterBrand />
            <FooterNavSection titleKey="footer.sections.content" items={FOOTER_NAVIGATION.main} />
            <FooterNavSection titleKey="footer.sections.help" items={FOOTER_NAVIGATION.support} />
            <FooterFeedback />
            <FooterDisclosure />
          </div>

          <FooterCopyright />
        </div>
      </div>
    </footer>
  );
}

function FooterBrand() {
  return (
    <div className="col-span-2 md:col-span-1">
      <Link href="/" className="flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="text-lg font-semibold tracking-tight text-foreground">CodeAtlas</span>
      </Link>
      <p className="mt-4 text-sm text-muted-foreground">{tServer('footer.brand.desc')}</p>
    </div>
  );
}

function FooterNavSection({ titleKey, items }: { titleKey: string; items: TFooterNavItem[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-foreground/80">{tServer(titleKey)}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {tServer(item.nameKey)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterDisclosure() {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-foreground/80">
        {tServer('footer.sections.disclosure')}
      </h3>
      <ul className="mt-4 space-y-2">
        <li className="text-sm text-muted-foreground">{tServer('footer.disclosure.updated')}</li>
        <li className="text-sm text-muted-foreground">{tServer('footer.disclosure.affiliate')}</li>
      </ul>
    </div>
  );
}

function FooterFeedback() {
  return (
    <div>
      <h3 className="text-xs font-semibold tracking-wide text-foreground/80">
        {tServer('footer.sections.feedback')}
      </h3>
      <ul className="mt-4 space-y-2">
        <li>
          <a
            href="mailto:zhangyue.joah@icloud.com"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tServer('footer.feedback.contact')}
          </a>
        </li>
      </ul>
    </div>
  );
}

function FooterCopyright() {
  return (
    <div className="mt-10 border-t border-border/60 pt-8">
      <p className="text-center text-sm text-muted-foreground">
        {tServer('footer.copyright', { year: new Date().getFullYear() })}
      </p>
    </div>
  );
}
