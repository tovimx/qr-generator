import { createServerClient, createBrowserClient } from '@supabase/ssr';

type SupabaseClient = ReturnType<typeof createServerClient> | ReturnType<typeof createBrowserClient>;
import { cookies } from 'next/headers';
import { EnhancedSupabaseError } from '@/lib/errors/api-error-handler';
import { ClientMetrics } from '@/lib/monitoring/client-metrics';
import { v4 as uuidv4 } from 'uuid';

type SupabaseServerClient = ReturnType<typeof createServerClient>;
type SupabaseBrowserClient = ReturnType<typeof createBrowserClient>;

export interface SupabaseClientManager {
  getServerClient(): Promise<SupabaseServerClient>;
  getBrowserClient(): SupabaseBrowserClient;
  withRetry<T>(operation: (client: SupabaseClient) => Promise<T>, operationName: string): Promise<T>;
  getMetrics(): ClientMetrics;
}

class ProductionClientManager implements SupabaseClientManager {
  private serverClientCache = new Map<string, { client: SupabaseServerClient; timestamp: number }>();
  private browserClient: SupabaseBrowserClient | null = null;
  private metrics = new ClientMetrics();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;

  async getServerClient(): Promise<SupabaseServerClient> {
    const requestId = this.getCurrentRequestId();
    
    // Check cache and TTL
    const cached = this.serverClientCache.get(requestId);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.client;
    }

    // Create new server client
    const client = await this.createServerClient();
    this.serverClientCache.set(requestId, {
      client,
      timestamp: Date.now()
    });
    
    // Schedule cleanup
    this.scheduleCleanup(requestId);
    
    return client;
  }

  getBrowserClient(): SupabaseBrowserClient {
    if (!this.browserClient) {
      this.browserClient = this.createBrowserClient();
    }
    return this.browserClient;
  }

  async withRetry<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    operationName: string
  ): Promise<T> {
    const requestId = uuidv4();
    this.metrics.recordOperationStart(operationName, requestId);
    
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        this.metrics.recordAttempt(operationName, attempt);
        
        // Get appropriate client (server-side by default in this context)
        const client = await this.getServerClient();
        
        const result = await operation(client);
        
        this.metrics.recordSuccess(operationName, attempt, requestId);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        this.metrics.recordError(operationName, attempt, error, requestId);
        
        const enhancedError = new EnhancedSupabaseError(
          lastError,
          {
            operation: operationName,
            attempt,
            timestamp: new Date(),
            requestId
          }
        );
        
        const retryRecommendation = enhancedError.getRetryRecommendation();
        
        // Don't retry if not recommended or on last attempt
        if (!retryRecommendation.shouldRetry || attempt >= this.MAX_RETRIES) {
          throw enhancedError;
        }
        
        // Record retry delay and wait
        this.metrics.recordRetryDelay(operationName, attempt, retryRecommendation.delayMs);
        await this.delay(retryRecommendation.delayMs);
      }
    }
    
    // This shouldn't be reached, but just in case
    throw new EnhancedSupabaseError(
      lastError || new Error('Unknown error occurred'),
      {
        operation: operationName,
        attempt: this.MAX_RETRIES,
        timestamp: new Date(),
        requestId
      }
    );
  }

  getMetrics(): ClientMetrics {
    return this.metrics;
  }

  private async createServerClient(): Promise<SupabaseServerClient> {
    const cookieStore = await cookies();
    
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
    const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    });
  }

  private createBrowserClient(): SupabaseBrowserClient {
    // Use environment variables safely in browser context
    const supabaseUrl = typeof window !== 'undefined' 
      ? process.env['NEXT_PUBLIC_SUPABASE_URL'] 
      : process.env['NEXT_PUBLIC_SUPABASE_URL'];
    
    const supabaseAnonKey = typeof window !== 'undefined'
      ? process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
      : process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    
    if (!supabaseAnonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }

    // URL validation
    if (!supabaseUrl.startsWith('https://')) {
      throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
    }

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  private getCurrentRequestId(): string {
    // In a real implementation, this would come from request headers or context
    // For now, we'll use a simple approach
    if (typeof window === 'undefined') {
      // Server-side: use a timestamp-based ID
      return `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    // Client-side: use a session-based ID
    return `client-${Date.now()}`;
  }

  private scheduleCleanup(requestId: string): void {
    // Clean up cache after TTL expires
    setTimeout(() => {
      this.serverClientCache.delete(requestId);
    }, this.CACHE_TTL + 1000); // Add 1s buffer
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to get performance insights (useful for monitoring endpoints)
  getPerformanceReport() {
    return this.metrics.getPerformanceReport();
  }

  // Method to clear metrics (useful for testing or periodic resets)
  resetMetrics(): void {
    this.metrics.reset();
  }
}

// Create singleton instance
export const clientManager = new ProductionClientManager();

// Export types for use in services
export type { SupabaseServerClient, SupabaseBrowserClient };