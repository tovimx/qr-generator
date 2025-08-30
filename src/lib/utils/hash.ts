import crypto from 'crypto';

export function hashIP(ip: string): string {
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;
  return crypto.createHash('sha256').update(ip + serviceRoleKey).digest('hex');
}