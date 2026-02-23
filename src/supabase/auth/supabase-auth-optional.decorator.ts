import { SetMetadata } from '@nestjs/common';
import { SUPABASE_AUTH_OPTIONAL } from './supabase-auth.guard';

/**
 * Use with SupabaseAuthGuard to allow unauthenticated requests.
 * When optional, req.user will be null if no valid token is provided.
 */
export const SupabaseAuthOptional = () => SetMetadata(SUPABASE_AUTH_OPTIONAL, true);
