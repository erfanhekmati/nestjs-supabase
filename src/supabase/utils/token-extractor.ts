export function extractBearerToken(req: { headers?: Record<string, string | string[] | undefined> } | null): string | null {
  const raw = req?.headers?.authorization || req?.headers?.Authorization;
  const header = Array.isArray(raw) ? raw[0] : raw;
  if (!header || typeof header !== 'string') return null;
  const [type, token] = header.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}
