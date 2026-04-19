import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'YuhPlace — Home, from wherever yuh deh';
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
          justifyContent: 'space-between',
          background: '#fcf9f8',
          fontFamily: 'sans-serif',
          padding: '72px 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative soft blob */}
        <div
          style={{
            position: 'absolute',
            top: -180,
            right: -160,
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'rgba(25,106,36,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -140,
            left: -120,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(241,227,64,0.18)',
          }}
        />

        {/* Top row: logo + tagline pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: 14,
                background: '#196a24',
              }}
            >
              <span style={{ fontSize: 34, fontWeight: 800, color: '#fcf9f8' }}>Y</span>
            </div>
            <span style={{ fontSize: 34, fontWeight: 800, color: '#1c1b1b', letterSpacing: -0.5 }}>
              YuhPlace
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: 999,
              background: '#F1FBF4',
              color: '#196a24',
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            For the Guyanese diaspora
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 96,
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
              fontSize: 96,
              fontWeight: 900,
              color: '#196a24',
              lineHeight: 0.95,
              letterSpacing: -3,
            }}
          >
            wherever yuh deh.
          </div>
          <div style={{ fontSize: 28, color: '#40493d', marginTop: 18, lineHeight: 1.3, maxWidth: 800 }}>
            Tour a property · Drop off supplies · Hire a trusted hand
          </div>
        </div>

        {/* Bottom trust row */}
        <div style={{ display: 'flex', gap: 10 }}>
          {['Vetted partners', 'Pay after the job&rsquo;s done', 'Proof at every step'].map((label) => (
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
              {label.replace('&rsquo;', '\u2019')}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
