import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase.constants';

/**
 * Inject the singleton (app-wide) Supabase client.
 * Use this for operations that don't need RLS (e.g. admin tasks with service role key).
 */
export const InjectSupabase = () => Inject(SUPABASE_CLIENT);
