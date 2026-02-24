import { DynamicModule, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SUPABASE_CLIENT, SUPABASE_OPTIONS, SUPABASE_REQUEST_CLIENT } from './supabase.constants';
import type { SupabaseModuleAsyncOptions, SupabaseModuleOptions } from './supabase.types';
import {
  createSupabaseClientFromOptions,
  createSupabaseClientProvider,
} from './providers/supabase-client.provider';
import {
  createSupabaseRequestClientFromOptions,
  createSupabaseRequestClientProvider,
} from './providers/supabase-request-client.provider';

@Module({})
export class SupabaseModule {
  static forRoot(options: SupabaseModuleOptions): DynamicModule {
    return {
      module: SupabaseModule,
      global: true,
      providers: [
        createSupabaseClientProvider(options),
        createSupabaseRequestClientProvider(options),
      ],
      exports: [SUPABASE_CLIENT, SUPABASE_REQUEST_CLIENT],
    };
  }

  static forRootAsync(options: SupabaseModuleAsyncOptions): DynamicModule {
    const asyncOptionsProvider = {
      provide: SUPABASE_OPTIONS,
      inject: options.inject ?? [],
      useFactory: options.useFactory,
    };

    return {
      module: SupabaseModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        asyncOptionsProvider,
        {
          provide: SUPABASE_CLIENT,
          inject: [SUPABASE_OPTIONS],
          useFactory: createSupabaseClientFromOptions,
        },
        {
          provide: SUPABASE_REQUEST_CLIENT,
          scope: Scope.REQUEST,
          inject: [SUPABASE_OPTIONS, REQUEST],
          useFactory: createSupabaseRequestClientFromOptions,
        },
      ],
      exports: [SUPABASE_CLIENT, SUPABASE_REQUEST_CLIENT],
    };
  }
}
