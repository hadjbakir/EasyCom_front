/* @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "https://easycom.rakmana-dz.com:1000",
        "http://easycom.rakmana-dz.com:1000",
      ],
    },
  },
  basePath: process.env.BASEPATH,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'easycom.rakmana-dz.com',
        port: '1000',
        pathname: '/storage/',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://easycom.rakmana-dz.com" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE" },
          { key: "Access-Control-Allow-Headers", value: "Authorization, Content-Type" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://easycom.rakmana-dz.com:1000/api/:path*",
      },
    ];
  },
  redirects: async () => [
    {
      source: '/',
      destination: '/en/front-pages/landing-page',
      permanent: true,
      locale: false,
    },
    {
      source: '/:lang(en|fr|ar)',
      destination: '/:lang/front-pages/landing-page',
      permanent: true,
      locale: false,
    },
    {
      source: '/((?!(?:en|fr|ar|front-pages|favicon.ico)\\b)):path',
      destination: '/en/:path',
      permanent: true,
      locale: false,
    },
  ],
};

export default nextConfig;
