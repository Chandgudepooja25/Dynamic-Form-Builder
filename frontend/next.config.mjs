import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Root package-lock.json (concurrently) + frontend/package-lock.json
  // make Next warn about an ambiguous tracing root. Pin it to /frontend.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
