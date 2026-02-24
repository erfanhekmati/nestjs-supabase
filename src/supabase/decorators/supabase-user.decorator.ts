import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const SupabaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Record<string, unknown> | null => {
    const req = ctx.switchToHttp().getRequest();
    return req.user ?? null;
  },
);
