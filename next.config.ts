/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other configurations you may have

  // IMPORTANT: Externalize Node.js native packages.
  // This tells Next.js (and Vercel's build process) to NOT bundle these,
  // but to resolve them at runtime from the node_modules folder.
  serverExternalPackages: [
    'sharp',
    'onnxruntime-node',
    // Include the parent package as well for safety, especially with pnpm/monorepos
    '@huggingface/transformers',
    'chromadb'
  ],

  // This is a common requirement for using native modules like onnxruntime-node
  // that can be very large and sometimes exceed Vercel's serverless function size limit.
  // This tells Vercel's file tracing to exclude unnecessary binary files.
  outputFileTracingExcludes: {
    '**/*': [
      // Exclude large binaries not needed for your specific architecture (Vercel uses linux-x64)
      'node_modules/onnxruntime-node/bin/**/arm64-darwin.node',
      'node_modules/onnxruntime-node/bin/**/x64-win32.node',
      // You can also look into excluding other specific arch folders for sharp if necessary,
      // but Vercel is usually good at handling sharp automatically.
    ],
  },
};

module.exports = nextConfig;
