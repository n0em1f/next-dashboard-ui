/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurația pentru imagini (rămâne intactă, așa cum o aveai)
  images: {
    remotePatterns: [
      { hostname: 'images.pexels.com' },
      { hostname: 'images.unsplash.com' },
      { hostname: 'img.clerk.com' },
    ],
  },

  // Ignoră erorile de TypeScript și ESLint la build (comasate, fără duplicate)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Soluția globală anti-eroare pentru pagini dinamice pe Vercel
  experimental: {
    staticGenerationBailoutOnDynamicQueries: true,
  },
};

export default nextConfig;
