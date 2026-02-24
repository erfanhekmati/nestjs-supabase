import { Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../supabase.constants';

export const InjectSupabase = () => Inject(SUPABASE_CLIENT);
