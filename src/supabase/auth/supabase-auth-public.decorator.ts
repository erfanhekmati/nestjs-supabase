import { SetMetadata } from '@nestjs/common';
import { SUPABASE_AUTH_PUBLIC } from './supabase-auth.guard';

export const Public = () => SetMetadata(SUPABASE_AUTH_PUBLIC, true);
