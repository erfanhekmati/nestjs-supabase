import { SetMetadata } from '@nestjs/common';
import { SUPABASE_AUTH_OPTIONAL } from './supabase-auth.guard';

export const SupabaseAuthOptional = () => SetMetadata(SUPABASE_AUTH_OPTIONAL, true);
