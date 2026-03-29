export function getErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message;
  return fallback;
}
