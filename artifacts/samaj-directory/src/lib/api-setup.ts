/**
 * Patches the global fetch to inject the JWT token from localStorage.
 * This ensures generated Orval React Query hooks work seamlessly with authentication.
 */
export function setupApiInterceptor() {
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem("samaj_token");
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    
    if (token && url.startsWith("/api")) {
      const newInit = { ...init };
      newInit.headers = {
        ...newInit.headers,
        Authorization: `Bearer ${token}`
      };
      return originalFetch(input, newInit);
    }
    
    return originalFetch(input, init);
  };
}
