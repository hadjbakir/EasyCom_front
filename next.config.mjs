/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  images: {
    domains: ['localhost', 'easycom-qfbwg.sevalla.app'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**'
      },
      {
        protocol: 'https',
        hostname: 'easycom-qfbwg.sevalla.app',
        pathname: '/storage/**'
      },
      {
        protocol: 'http',
        hostname: 'easycom-qfbwg.sevalla.app',
        pathname: '/storage/**'
      }
    ],
    unoptimized: true
  },
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/en/front-pages/landing-page',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/front-pages/landing-page',
        permanent: true,
        locale: false
      },
      {
        source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
        destination: '/en/:path',
        permanent: true,
        locale: false
      }
    ]
  }
}

export default nextConfig
