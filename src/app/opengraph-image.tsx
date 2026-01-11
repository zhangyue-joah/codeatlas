import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

export const runtime = 'edge';
export const alt = 'CodeAtlas - AI coding tools map';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function getHostname(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export default function OpenGraphImage() {
  const hostname = getHostname(siteConfig.url);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b1020 0%, #111827 55%, #0b1020 100%)',
          color: '#e5e7eb',
        }}
      >
        <div
          style={{
            width: 1040,
            height: 470,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 56,
            borderRadius: 48,
            border: '1px solid #ffffff1f',
            background:
              'linear-gradient(0deg, #ffffff05, #ffffff05), radial-gradient(circle at 20% 10%, #3b82f659 0%, transparent 60%), radial-gradient(circle at 80% 90%, #a855f738 0%, transparent 60%)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05 }}>
              {siteConfig.name}
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.25, opacity: 0.92, maxWidth: 920 }}>
              AI coding tools · comparisons · guides · buying tips
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 22,
              opacity: 0.85,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                }}
              />
              <div>Pick tools → Apply workflows → Buy wisely</div>
            </div>
            <div>{hostname}</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
