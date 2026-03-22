import { setAuthTokenGetter } from "@workspace/api-client-react";

/**
 * Registers the JWT token getter with the generated API client.
 * This ensures all generated Orval React Query hooks automatically
 * send the Authorization header without patching global fetch
 * (which would break Content-Type and other headers).
 */
export function setupApiInterceptor() {
  setAuthTokenGetter(() => localStorage.getItem("samaj_token"));
}
