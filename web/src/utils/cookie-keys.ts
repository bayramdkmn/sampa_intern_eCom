export const CookieKeys = {
  AUTH: "auth_token",
  USER: "user_data",
  REFRESH: "refresh_token",
} as const;

export type CookieKey = keyof typeof CookieKeys;
