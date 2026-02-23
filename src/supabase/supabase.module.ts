import { DynamicModule, Module, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT, SUPABASE_OPTIONS, SUPABASE_REQUEST_CLIENT } from './supabase.constants';
import type { SupabaseModuleAsyncOptions, SupabaseModuleOptions } from './supabase.types';
import { extractBearerToken } from './utils/token-extractor';

@Module({})
export class SupabaseModule {
  /**
   * Register the Supabase module with static configuration.
   */
  static forRoot(options: SupabaseModuleOptions): DynamicModule {
    const optionsProvider = {
      provide: SUPABASE_OPTIONS,
      useValue: options,
    };

    return {
      module: SupabaseModule,
      global: true,
      providers: [
        optionsProvider,
        {
          provide: SUPABASE_CLIENT,
          inject: [SUPABASE_OPTIONS],
          useFactory: (opts: SupabaseModuleOptions) =>
            createClient(opts.url, opts.key, opts.options),
        },
        {
          provide: SUPABASE_REQUEST_CLIENT,
          scope: Scope.REQUEST,
          inject: [SUPABASE_OPTIONS, REQUEST],
          useFactory: (
            opts: SupabaseModuleOptions,
            req: { headers?: Record<string, string | string[] | undefined> },
          ) => {
            const token = extractBearerToken(req);
            return createClient(opts.url, opts.key, {
              ...opts.options,
              global: {
                ...opts.options?.global,
                headers: {
                  ...opts.options?.global?.headers,
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              },
            });
          },
        },
      ],
      exports: [SUPABASE_CLIENT, SUPABASE_REQUEST_CLIENT],
    };
  }

  /**
   * Register the Supabase module with async configuration (e.g. ConfigService).
   */
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
          useFactory: (opts: SupabaseModuleOptions) =>
            createClient(opts.url, opts.key, opts.options),
        },
        {
          provide: SUPABASE_REQUEST_CLIENT,
          scope: Scope.REQUEST,
          inject: [SUPABASE_OPTIONS, REQUEST],
          useFactory: (
            opts: SupabaseModuleOptions,
            req: { headers?: Record<string, string | string[] | undefined> },
          ) => {
            const token = extractBearerToken(req);
            return createClient(opts.url, opts.key, {
              ...opts.options,
              global: {
                ...opts.options?.global,
                headers: {
                  ...opts.options?.global?.headers,
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              },
            });
          },
        },
      ],
      exports: [SUPABASE_CLIENT, SUPABASE_REQUEST_CLIENT],
    };
  }
}
