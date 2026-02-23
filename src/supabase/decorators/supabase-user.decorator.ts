import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extract the authenticated user from the request.
 * Requires SupabaseAuthGuard (or equivalent) to attach req.user.
 */
export const SupabaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Record<string, unknown> | null => {
    const req = ctx.switchToHttp().getRequest();
    return req.user ?? null;
  },
);
