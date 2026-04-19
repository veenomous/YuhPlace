import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'YuhPlace — Home, from wherever yuh deh';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Full YuhPlace logo (pin + gradient + white Y + "YuhPlace" wordmark).
// Inlined as a data URI so next/og renders it without fetching /logo.svg.
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 250"><defs><linearGradient id="b" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#1F5FAF"/><stop offset="55%" stop-color="#2D7BC3"/><stop offset="70%" stop-color="#4FAE5E"/><stop offset="100%" stop-color="#57B947"/></linearGradient><radialGradient id="h" cx="35%" cy="25%" r="60%"><stop offset="0%" stop-color="white" stop-opacity="0.35"/><stop offset="100%" stop-color="white" stop-opacity="0"/></radialGradient><radialGradient id="s" cx="50%" cy="100%" r="70%"><stop offset="0%" stop-color="black" stop-opacity="0.25"/><stop offset="100%" stop-color="black" stop-opacity="0"/></radialGradient></defs><path d="M125 20C80 20 50 55 50 95C50 150 125 220 125 220C125 220 200 150 200 95C200 55 170 20 125 20Z" fill="url(#b)"/><path d="M125 20C80 20 50 55 50 95C50 150 125 220 125 220C125 220 200 150 200 95C200 55 170 20 125 20Z" fill="url(#h)"/><path d="M125 20C80 20 50 55 50 95C50 150 125 220 125 220C125 220 200 150 200 95C200 55 170 20 125 20Z" fill="url(#s)"/><path d="M105 70L125 100L145 70L160 70L135 110L135 145L115 145L115 110L90 70Z" fill="white"/><text x="240" y="135" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="600" fill="#1c1b1b">YuhPlace</text></svg>`;

const LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#fcf9f8',
          fontFamily: 'sans-serif',
          padding: '64px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative soft blobs */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -180,
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'rgba(25,106,36,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -160,
            left: -140,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(241,227,64,0.18)',
          }}
        />

        {/* Top row: real logo + tagline pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} alt="YuhPlace" width={384} height={120} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 22px',
              borderRadius: 999,
              background: '#F1FBF4',
              color: '#196a24',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            For the Guyanese diaspora
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 960 }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 900,
              color: '#1c1b1b',
              lineHeight: 0.95,
              letterSpacing: -3,
            }}
          >
            Home, from
          </div>
          <div
            style={{
              fontSize: 104,
              fontWeight: 900,
              color: '#196a24',
              lineHeight: 0.95,
              letterSpacing: -3,
            }}
          >
            wherever yuh deh.
          </div>
          <div style={{ fontSize: 30, color: '#40493d', marginTop: 16, lineHeight: 1.3, maxWidth: 820 }}>
            Tour a property · Drop off supplies · Hire a trusted hand
          </div>
        </div>

        {/* Bottom trust row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {['Vetted partners', 'Pay after the job\u2019s done', 'Proof at every step'].map((label) => (
            <div
              key={label}
              style={{
                padding: '12px 22px',
                borderRadius: 999,
                background: '#ffffff',
                color: '#1c1b1b',
                fontSize: 20,
                fontWeight: 600,
                border: '1px solid #e5e2e1',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
