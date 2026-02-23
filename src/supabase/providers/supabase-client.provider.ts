import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase.constants';
import type { SupabaseModuleOptions } from '../supabase.types';
export function createSupabaseClientProvider(opts: SupabaseModuleOptions) {
  return {
    provide: SUPABASE_CLIENT,
    useFactory: () => createClient(opts.url, opts.key, opts.options),
  };
}
