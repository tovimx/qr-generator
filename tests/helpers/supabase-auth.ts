import { createClient } from '@supabase/supabase-js';
import type { Page } from '@playwright/test';

// Test environment Supabase client
export function createTestSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not set');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Create a test user in Supabase
export async function createTestUser(email: string, password: string) {
  const supabase = createTestSupabaseClient();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Test User',
      }
    }
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return data;
}

// Delete a test user from Supabase (requires admin privileges)
export async function deleteTestUser(userId: string) {
  // Note: This requires admin privileges which the anon key doesn't have
  // In a real test environment, you'd use a service role key or 
  // clean up users through a different mechanism
  console.warn('User deletion not implemented - requires admin privileges');
}

// Login as test user and get session
export async function loginTestUser(email: string, password: string) {
  const supabase = createTestSupabaseClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to login test user: ${error.message}`);
  }

  return data;
}

// Set authentication cookies in the browser
export async function setAuthCookies(page: Page, session: any) {
  // Set the Supabase auth cookies
  await page.context().addCookies([
    {
      name: 'sb-access-token',
      value: session.access_token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false, // Set to true in production
      sameSite: 'Lax',
    },
    {
      name: 'sb-refresh-token',
      value: session.refresh_token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    },
  ]);
}

// Helper to authenticate a page before tests
export async function authenticatePage(page: Page, email: string, password: string) {
  try {
    // Try to login
    const { session } = await loginTestUser(email, password);
    
    if (session) {
      await setAuthCookies(page, session);
      return session;
    }
  } catch (error) {
    // If login fails, try to create the user first
    console.log('Login failed, attempting to create user...');
    await createTestUser(email, password);
    
    // Now login
    const { session } = await loginTestUser(email, password);
    
    if (session) {
      await setAuthCookies(page, session);
      return session;
    }
  }
  
  throw new Error('Failed to authenticate test user');
}

// Generate unique test email
export function generateTestEmail(prefix = 'test') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

// Clean up test data (to be called after tests)
export async function cleanupTestData(userId: string) {
  // In a real test environment, you would:
  // 1. Delete the user's QR codes
  // 2. Delete the user's links
  // 3. Delete the user's analytics data
  // 4. Delete the user account
  
  // For now, we'll just log a warning
  console.warn('Test data cleanup not fully implemented');
}