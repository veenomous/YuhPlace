import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'YuhPlace — Your place for Guyana';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #009E49 0%, #FCD116 50%, #CE1126 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            padding: '48px 64px',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 700, color: '#111' }}>
            YuhPlace
          </div>
          <div style={{ fontSize: 28, color: '#555', marginTop: 12 }}>
            Your place for Guyana
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
