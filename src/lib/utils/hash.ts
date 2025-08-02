import crypto from 'crypto';

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex');
}