import crypto from 'crypto';
import { ENV } from '@/lib/env';

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + ENV.SUPABASE_SERVICE_ROLE_KEY()).digest('hex');
}