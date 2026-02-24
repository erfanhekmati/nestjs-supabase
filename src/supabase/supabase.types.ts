import type { createClient } from '@supabase/supabase-js';

export interface SupabaseModuleOptions {
  url: string;
  key: string;
  options?: Parameters<typeof createClient>[2];
}

export interface SupabaseModuleAsyncOptions {
  imports?: any[];
  inject?: any[];
  useFactory: (...args: any[]) => SupabaseModuleOptions | Promise<SupabaseModuleOptions>;
}
