const isProd = process.env.NODE_ENV === 'production';
let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// If deployed on Vercel but NEXT_PUBLIC_API_URL was accidentally left as localhost,
// force it to be an empty string so the rewrites take over.
if (isProd && API_BASE_URL.includes('localhost')) {
  API_BASE_URL = '';
} else if (!isProd && !API_BASE_URL) {
  API_BASE_URL = 'http://localhost:5000';
}

export default API_BASE_URL;
