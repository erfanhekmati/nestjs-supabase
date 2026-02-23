# nestjs-supabase

Supabase integration for NestJS — DI, request-scoped client with RLS support, auth guard, and error helpers.

## Features

- **SupabaseModule** — Easy setup with `forRoot` / `forRootAsync`
- **Request-scoped client** — Automatically forwards `Authorization` header so RLS works
- **Auth guard** — Validates JWT and attaches user to request
- **Error helper** — Maps Supabase errors to NestJS `HttpException`s
- **Decorators** — `@InjectSupabase()`, `@InjectSupabaseRequest()`, `@SupabaseUser()`

## Installation

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

Use for operations that bypass RLS (e.g. with service role key):

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

Use for user-facing operations. The Bearer token is automatically forwarded, so RLS works:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectSupabaseRequest, throwIfSupabaseError } from 'nestjs-supabase';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UsersService {
  constructor(@InjectSupabaseRequest() private readonly supabase: SupabaseClient) {}

  async me() {
    const res = await this.supabase.from('profiles').select('*').single();
    throwIfSupabaseError(res);
    return res.data;
  }
}
```

### Auth guard + user decorator

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  SupabaseAuthGuard,
  SupabaseAuthModule,
  SupabaseUser,
} from 'nestjs-supabase';

@Controller('profile')
@UseGuards(SupabaseAuthGuard)
export class ProfileController {
  @Get()
  getProfile(@SupabaseUser() user: Record<string, unknown> | null) {
    return user;
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

```typescript
import { UseGuards } from '@nestjs/common';
import {
  SupabaseAuthGuard,
  SupabaseAuthOptional,
  SupabaseUser,
} from 'nestjs-supabase';

@UseGuards(SupabaseAuthGuard)
@SupabaseAuthOptional()
@Get('/feed')
getFeed(@SupabaseUser() user: Record<string, unknown> | null) {
  // user is null if not authenticated
  return this.feedService.getFeed(user?.id);
}
```

### Error helper

Supabase returns `{ data, error }`. Use `throwIfSupabaseError` to convert errors to NestJS exceptions:

```typescript
const res = await this.supabase.from('users').select('*');
throwIfSupabaseError(res);  // throws BadRequestException, NotFoundException, etc.
return res.data;
```

Mapped status codes: 400 → BadRequest, 401 → Unauthorized, 403 → Forbidden, 404 → NotFound, 409 → Conflict.

## API Reference

| Export | Description |
|--------|-------------|
| `SupabaseModule` | Core module; use `forRoot()` or `forRootAsync()` |
| `SupabaseAuthModule` | Optional; provides `SupabaseAuthGuard` |
| `InjectSupabase()` | Inject singleton client |
| `InjectSupabaseRequest()` | Inject request-scoped client (RLS) |
| `SupabaseUser()` | Param decorator for `req.user` |
| `SupabaseAuthOptional()` | Allow unauthenticated requests |
| `SupabaseAuthGuard` | JWT validation guard |
| `throwIfSupabaseError(result)` | Convert Supabase errors to HttpException |

## License

MIT
