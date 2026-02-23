// Core module
export * from './supabase/supabase.module';
export type { SupabaseModuleOptions, SupabaseModuleAsyncOptions } from './supabase/supabase.types';

// Decorators
export * from './supabase/decorators/inject-supabase.decorator';
export * from './supabase/decorators/inject-supabase-request.decorator';
export * from './supabase/decorators/supabase-user.decorator';

// Utils
export * from './supabase/utils/supabase-error';

// Auth (optional)
export * from './supabase/auth/supabase-auth.module';
export * from './supabase/auth/supabase-auth.guard';
export * from './supabase/auth/supabase-auth-optional.decorator';
