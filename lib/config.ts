export const DEFAULT_API_URL = process.env.EXPO_PUBLIC_API_URL;

export const STORAGE_KEY_WELCOME_COMPLETED = "@mediatools_welcome_completed";

export function withApiSecret(url: string): string {
  return url;
}

export function useAppConfig() {
  return { apiUrl: DEFAULT_API_URL };
}
