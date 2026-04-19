import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YuhPlace — Home, from wherever yuh deh',
    short_name: 'YuhPlace',
    description:
      'For the Guyanese diaspora. Send somebody to tour a property, drop off supplies, or fix what needs fixing in Guyana.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fcf9f8',
    theme_color: '#196a24',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
