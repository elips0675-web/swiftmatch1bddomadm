// Stubs — server-only Next APIs are not available in client-only Vite app.
export function cookies() {
  return {
    get: (_: string) => undefined,
    set: (_: string, __: string) => {},
    delete: (_: string) => {},
  };
}
export function headers() {
  return new Headers();
}
