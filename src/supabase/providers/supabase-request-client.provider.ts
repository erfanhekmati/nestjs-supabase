import { createClient } from '@supabase/supabase-js';
import { Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SUPABASE_REQUEST_CLIENT } from '../supabase.constants';
import type { SupabaseModuleOptions } from '../supabase.types';
import { extractBearerToken } from '../utils/token-extractor';

type RequestWithHeaders = { headers?: Record<string, string | string[] | undefined> };

export function createSupabaseRequestClientFromOptions(
  opts: SupabaseModuleOptions,
  req: RequestWithHeaders,
) {
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
}

export function createSupabaseRequestClientProvider(opts: SupabaseModuleOptions) {
  return {
    provide: SUPABASE_REQUEST_CLIENT,
    scope: Scope.REQUEST,
    inject: [REQUEST],
    useFactory: (req: RequestWithHeaders) => createSupabaseRequestClientFromOptions(opts, req),
  };
}
