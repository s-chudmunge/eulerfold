import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const getSupabaseClient = (): SupabaseClient => {
  const isValidUrl = (url: string) => {
    try {
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  if (supabaseUrl && supabaseAnonKey && isValidUrl(supabaseUrl)) {
    try {
      return createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storageKey: 'eulerfold-auth-token',
        }
      });
    } catch (e) {
      console.error("Failed to initialize Supabase client:", e);
    }
  }

  // Return a "safe" mock/proxy client for SSR or missing config
  const disabledOperation = (prop: string | symbol) => {
    return () => {
      console.warn(`Supabase operation "${String(prop)}" called but client is not configured.`);
      return { data: null, error: { message: 'Supabase not configured' } };
    };
  };

  return new Proxy({} as SupabaseClient, {
    get: (target, prop) => {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null }),
          signInWithPassword: disabledOperation('signInWithPassword'),
          signOut: disabledOperation('signOut'),
        };
      }
      if (prop === 'from' || prop === 'table') {
        return () => ({
          select: disabledOperation('select'),
          insert: disabledOperation('insert'),
          update: disabledOperation('update'),
          delete: disabledOperation('delete'),
        });
      }
      
      // For any other property access, return a function that throws if called,
      // or just throw if it's a property access.
      return () => disabledOperation(prop);
    },
  });
};

export const supabase = getSupabaseClient();
