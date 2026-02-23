import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { InjectSupabase } from '../decorators/inject-supabase.decorator';
import { extractBearerToken } from '../utils/token-extractor';

export const SUPABASE_AUTH_OPTIONAL = 'supabase_auth_optional';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    @InjectSupabase() private readonly supabase: SupabaseClient,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const optional =
      this.reflector.getAllAndOverride<boolean>(SUPABASE_AUTH_OPTIONAL, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const request = context.switchToHttp().getRequest();
    const token = extractBearerToken(request);

    if (!token) {
      if (optional) {
        request.user = null;
        return true;
      }
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error) {
      if (optional) {
        request.user = null;
        return true;
      }
      throw new UnauthorizedException(error.message ?? 'Invalid token');
    }

    if (!user && !optional) {
      throw new UnauthorizedException('User not found');
    }

    request.user = user ?? null;
    return true;
  }
}
