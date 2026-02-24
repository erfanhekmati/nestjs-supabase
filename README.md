# nestjs-supabase

Drop Supabase into your NestJS app without the fuss. You get dependency injection, a request-scoped client that plays nice with RLS, an auth guard, and helpers to turn Supabase errors into proper Nest exceptions.

## What you get

- **SupabaseModule** — Wire it up with `forRoot` or `forRootAsync`, depending on how you like to config things
- **Request-scoped client** — Sends the `Authorization` header along so Row Level Security actually works
- **Auth guard** — JWT validation out of the box; mark routes as `@Public()` when you want to skip it
- **Error helper** — No more manual `if (res.error)` checks; it maps Supabase errors to NestJS `HttpException`s
- **Decorators** — `@InjectSupabase()`, `@InjectSupabaseRequest()`, `@SupabaseUser()`, `@Public()`, `@SupabaseAuthOptional()` for cleaner code

## Install

You’ll need NestJS 10 or 11 and Node 18+.

```bash
npm install nestjs-supabase @supabase/supabase-js
```

## Setup

### Static config

If your URL and key are plain env vars, this is all you need:

```typescript
import { Module } from '@nestjs/common';
import { SupabaseModule } from 'nestjs-supabase';

@Module({
  imports: [
    SupabaseModule.forRoot({
      url: process.env.SUPABASE_URL!,
      key: process.env.SUPABASE_KEY!,
    }),
  ],
})
export class AppModule {}
```

### Async config (ConfigService)

Using `@nestjs/config`? No problem — use `forRootAsync` instead:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseModule } from 'nestjs-supabase';

@Module({
  imports: [
    SupabaseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.getOrThrow('SUPABASE_URL'),
        key: config.getOrThrow('SUPABASE_SERVICE_KEY'),
      }),
    }),
  ],
})
export class AppModule {}
```

## Usage

### Admin / service role client

For backend-only stuff that bypasses RLS — cron jobs, migrations, admin APIs. Use your **service role key** here and keep it secret. Never expose it to the frontend.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectSupabase, throwIfSupabaseError } from 'nestjs-supabase';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AdminService {
  constructor(@InjectSupabase() private readonly supabase: SupabaseClient) {}

  async allUsers() {
    const res = await this.supabase.from('users').select('*');
    throwIfSupabaseError(res);
    return res.data;
  }
}
```

### Request-scoped client (RLS)

When you’re dealing with user-facing data, use the request-scoped client. It forwards the Bearer token automatically, so RLS kicks in as expected.

**Heads up:** Any service that injects `@InjectSupabaseRequest()` needs to be request-scoped, or Nest will complain about scope mismatch.

```typescript
import { Injectable, Scope } from '@nestjs/common';
import { InjectSupabaseRequest, throwIfSupabaseError } from 'nestjs-supabase';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable({ scope: Scope.REQUEST })
export class UsersService {
  constructor(@InjectSupabaseRequest() private readonly supabase: SupabaseClient) {}

  async me() {
    const res = await this.supabase.from('profiles').select('*').single();
    throwIfSupabaseError(res);
    return res.data;
  }
}
```

### Auth guard

`SupabaseAuthModule` turns on auth by default — every route expects a valid JWT. Add `@Public()` to routes or controllers you want to keep open:

```typescript
import { Controller, Get } from '@nestjs/common';
import { Public, SupabaseUser } from 'nestjs-supabase';

@Controller('profile')
export class ProfileController {
  @Get()
  getProfile(@SupabaseUser() user: Record<string, unknown> | null) {
    return user;
  }
}

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health() {
    return { status: 'ok' };
  }
}
```

Don’t forget to import `SupabaseAuthModule` in your app module:

```typescript
import { SupabaseAuthModule } from 'nestjs-supabase';

@Module({
  imports: [SupabaseModule.forRoot(...), SupabaseAuthModule],
})
export class AppModule {}
```

### Optional auth

Sometimes a route should work for everyone, but you still want the user when they’re logged in. That’s what `@SupabaseAuthOptional()` is for:

```typescript
import { Controller, Get } from '@nestjs/common';
import {
  SupabaseAuthOptional,
  SupabaseUser,
} from 'nestjs-supabase';

@Controller('feed')
export class FeedController {
  @SupabaseAuthOptional()
  @Get()
  getFeed(@SupabaseUser() user: Record<string, unknown> | null) {
    return { feed: [], userId: user?.id ?? null };
  }
}
```

### Error helper

Supabase gives you `{ data, error }`. Instead of checking `res.error` everywhere, use `throwIfSupabaseError` — it turns those into proper NestJS exceptions:

```typescript
const res = await this.supabase.from('users').select('*');
throwIfSupabaseError(res);
return res.data;
```

Status mapping: 400 → BadRequest, 401 → Unauthorized, 403 → Forbidden, 404 → NotFound, 409 → Conflict.

## API reference

| Export | What it does |
|--------|--------------|
| `SupabaseModule` | Core module; use `forRoot()` or `forRootAsync()` |
| `SupabaseModuleOptions` | Config for `forRoot()`; `url`, `key`, optional `options` (createClient 3rd param) |
| `SupabaseModuleAsyncOptions` | Config for `forRootAsync()`; `imports`, `inject`, `useFactory` |
| `SupabaseAuthModule` | Optional; registers `SupabaseAuthGuard` globally |
| `InjectSupabase()` | Inject the singleton client |
| `InjectSupabaseRequest()` | Inject the request-scoped client (RLS); consumer must be `Scope.REQUEST` |
| `SupabaseUser()` | Param decorator for `req.user` |
| `Public()` | Skip auth on a route or controller |
| `SupabaseAuthOptional()` | Allow unauthenticated requests; attach user when present |
| `SupabaseAuthGuard` | JWT validation guard |
| `throwIfSupabaseError(result)` | Convert Supabase errors to HttpException |

## License

MIT
