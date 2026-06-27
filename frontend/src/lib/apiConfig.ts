const isProd = process.env.NODE_ENV === 'production';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (isProd ? '' : 'http://localhost:5000');

export default API_BASE_URL;
