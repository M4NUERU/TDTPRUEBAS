import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(glb|gltf)$/,
            type: 'asset/resource',
        })
        return config
    },
    transpilePackages: ['three'],
}

export default nextConfig
