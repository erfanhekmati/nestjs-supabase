import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.constants';
import type { SupabaseModuleOptions } from '../supabase.types';

export function createSupabaseClientFromOptions(opts: SupabaseModuleOptions) {
  return createClient(opts.url, opts.key, opts.options);
}

export function createSupabaseClientProvider(opts: SupabaseModuleOptions) {
  return {
    provide: SUPABASE_CLIENT,
    useFactory: () => createSupabaseClientFromOptions(opts),
  };
}
