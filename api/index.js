import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// This file is for Vercel serverless function compatibility
export default async function handler(req, res) {
  // Import the main server app
  const app = (await import('./server.js')).default;
  
  // Handle the request
  return app(req, res);
}