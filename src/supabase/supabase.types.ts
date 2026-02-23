import type { createClient } from '@supabase/supabase-js';

export interface SupabaseModuleOptions {
  /** Supabase project URL */
  url: string;
  /** Supabase anon or service role key */
  key: string;
  /** Optional Supabase client options (third param of createClient) */
  options?: Parameters<typeof createClient>[2];
}

export interface SupabaseModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => SupabaseModuleOptions | Promise<SupabaseModuleOptions>;
}
