import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from './supabase-auth.guard';

/**
 * Optional auth submodule. Provides SupabaseAuthGuard for JWT validation.
 * Requires SupabaseModule.forRoot() or forRootAsync() to be imported first.
 */
@Module({
  providers: [SupabaseAuthGuard],
  exports: [SupabaseAuthGuard],
})
export class SupabaseAuthModule {}
