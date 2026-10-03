import crypto from 'crypto';

export function hashClientIp(rawIp) {
  if (!rawIp || rawIp === 'unknown') return '0000000000000000';
  const dateStr = new Date().toISOString().split('T')[0];
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY || 'default-salt';
  const secretKey = `${salt}:${dateStr}`;
  return crypto.createHmac('sha256', secretKey).update(rawIp.trim()).digest('hex').slice(0, 16);
}

export function summarizeUserAgent(ua) {
  if (!ua) return 'Unknown/Unknown';
  let browser = 'Other';
  let os = 'Other';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS') || ua.includes('Macintosh')) os = 'macOS';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('Linux')) os = 'Linux';

  if (ua.includes('Edg/')) browser = 'Edge';
  else if (ua.includes('Chrome/')) browser = 'Chrome';
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox/')) browser = 'Firefox';

  return `${browser}/${os}`.slice(0, 64);
}

const hash = hashClientIp('192.168.1.100');
const ua = summarizeUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

console.log('✅ Hashed IP (16 chars):', hash, 'length:', hash.length);
console.log('✅ UA Summary:', ua);
