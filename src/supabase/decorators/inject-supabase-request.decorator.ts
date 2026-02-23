import { Inject } from '@nestjs/common';
import { SUPABASE_REQUEST_CLIENT } from '../supabase.constants';

/**
 * Inject the request-scoped Supabase client.
 * Automatically forwards the Authorization header (Bearer token) so RLS works.
 * Use this for user-facing operations where RLS policies apply.
 */
export const InjectSupabaseRequest = () => Inject(SUPABASE_REQUEST_CLIENT);
