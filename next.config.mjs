/** @type {import('next').NextConfig} */
const nextConfig = {
  // 避免 dev/build 共享同一个 `.next` 导致静态资源错配（尤其在同步盘路径下更容易“丢 chunk”）
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',

  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // 本项目运行时用 `fs` 读取 `src/content`（MDX）。在某些 Serverless/Tracing 场景下需显式包含内容文件。
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['src/content/**/*'],
    },
  },

  /**
   * iCloud/同步盘路径下，Webpack 文件缓存的原子 rename 偶发失败，
   * 可能导致 `.next` 产物不一致（例如缺失 chunk）。开发环境改用内存缓存以提升稳定性。
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: 'memory' };
    }
    return config;
  },

  // 重定向规则
  async redirects() {
    return [
      {
        source: '/tool/:slug',
        destination: '/tools/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
