const KEY = "session_token";

export function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, token);
  }
  return token;
}
