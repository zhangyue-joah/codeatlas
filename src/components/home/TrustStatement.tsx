import { tServer } from '@/i18n/server';

/**
 * 声明与透明度：作为“次级信息面板”存在，避免与上方主入口争夺注意力。
 * 设计目标：统一宽度体系与 surface 语言（圆角 / 弱底色 / 弱边界）。
 */
export function TrustStatement() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-muted/15 p-8 ring-1 ring-border/40 sm:p-10">
            <h2 className="text-center font-display text-xl font-medium tracking-tight text-foreground sm:text-2xl">
              {tServer('home.trust.title')}
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-6">
              <TrustItem
                icon={<ClockIcon />}
                title={tServer('home.trust.updated.title')}
                description={tServer('home.trust.updated.desc')}
              />
              <TrustItem
                icon={<ShieldIcon />}
                title={tServer('home.trust.affiliate.title')}
                description={tServer('home.trust.affiliate.desc')}
              />
              <TrustItem
                icon={<ChartIcon />}
                title={tServer('home.trust.independent.title')}
                description={tServer('home.trust.independent.desc')}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-background/80 p-6 text-center ring-1 ring-border/40">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-foreground/70 ring-1 ring-border/40">
        {icon}
      </span>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h16.5m0 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
      />
    </svg>
  );
}
