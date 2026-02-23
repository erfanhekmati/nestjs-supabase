import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Throws a NestJS HttpException if the Supabase result contains an error.
 * Maps Supabase error status codes to appropriate NestJS exceptions.
 */
export function throwIfSupabaseError<T extends { error?: { status?: number; code?: string | number; message?: string } }>(
  result: T,
): asserts result is T & { error: undefined } {
  const err = result?.error;
  if (!err) return;

  const status = (err.status ?? err.code) as number | undefined;
  const message = err.message ?? 'Supabase error';

  switch (status) {
    case 400:
      throw new BadRequestException(message);
    case 401:
      throw new UnauthorizedException(message);
    case 403:
      throw new ForbiddenException(message);
    case 404:
      throw new NotFoundException(message);
    case 409:
      throw new ConflictException(message);
    default:
      throw new InternalServerErrorException(message);
  }
}
