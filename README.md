# nestjs-supabase

Supabase integration for NestJS — DI, request-scoped client with RLS support, auth guard, and error helpers.

## Features

- **SupabaseModule** — Easy setup with `forRoot` / `forRootAsync`
- **Request-scoped client** — Automatically forwards `Authorization` header so RLS works
- **Auth guard** — Global JWT validation; use `@Public()` to skip auth on specific routes
- **Error helper** — Maps Supabase errors to NestJS `HttpException`s
- **Decorators** — `@InjectSupabase()`, `@InjectSupabaseRequest()`, `@SupabaseUser()`, `@Public()`, `@SupabaseAuthOptional()`

## Installation

Requires NestJS 10 or 11, Node 18+.

```bash
npm install nestjs-supabase @supabase/supabase-js
```

## Setup

### Static config

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

### Singleton client (admin / service role)

Use for operations that bypass RLS. Pass the **service role key** in `forRoot` (never expose this to clients). For user-facing operations, use the request-scoped client instead.

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

Use for user-facing operations. The Bearer token is automatically forwarded, so RLS works.

**Important:** Services that inject `@InjectSupabaseRequest()` must be request-scoped. Otherwise Nest will throw a scope mismatch error.

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

### Auth guard (global by default)

`SupabaseAuthModule` registers the guard globally — all routes require authentication by default. Use `@Public()` on routes or controllers to bypass auth:

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

Import `SupabaseAuthModule` in your app module:

```typescript
import { SupabaseAuthModule } from 'nestjs-supabase';

@Module({
  imports: [SupabaseModule.forRoot(...), SupabaseAuthModule],
})
export class AppModule {}
```

### Optional auth (public routes with user when present)

Use `@SupabaseAuthOptional()` when you want to allow unauthenticated requests but still attach the user when a valid token is provided:

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

Supabase returns `{ data, error }`. Use `throwIfSupabaseError` to convert errors to NestJS exceptions:

```typescript
const res = await this.supabase.from('users').select('*');
throwIfSupabaseError(res);
return res.data;
```

Mapped status codes: 400 → BadRequest, 401 → Unauthorized, 403 → Forbidden, 404 → NotFound, 409 → Conflict.

## API Reference

| Export | Description |
|--------|-------------|
| `SupabaseModule` | Core module; use `forRoot()` or `forRootAsync()` |
| `SupabaseModuleOptions` | Config for `forRoot()`; `url`, `key`, optional `options` (createClient 3rd param) |
| `SupabaseModuleAsyncOptions` | Config for `forRootAsync()`; `imports`, `inject`, `useFactory` |
| `SupabaseAuthModule` | Optional; registers `SupabaseAuthGuard` globally |
| `InjectSupabase()` | Inject singleton client |
| `InjectSupabaseRequest()` | Inject request-scoped client (RLS); consumer must be `Scope.REQUEST` |
| `SupabaseUser()` | Param decorator for `req.user` |
| `Public()` | Skip auth on route or controller |
| `SupabaseAuthOptional()` | Allow unauthenticated requests; attach user when present |
| `SupabaseAuthGuard` | JWT validation guard |
| `throwIfSupabaseError(result)` | Convert Supabase errors to HttpException |

## License

MIT
