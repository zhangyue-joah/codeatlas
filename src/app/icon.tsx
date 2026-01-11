import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0b1020 0%, #111827 55%, #0b1020 100%)',
          border: '1px solid #ffffff1f',
          color: '#e5e7eb',
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        CA
      </div>
    ),
    size
  );
}
