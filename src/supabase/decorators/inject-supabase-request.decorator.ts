import { Inject } from '@nestjs/common';
import { SUPABASE_REQUEST_CLIENT } from '../supabase.constants';

export const InjectSupabaseRequest = () => Inject(SUPABASE_REQUEST_CLIENT);
