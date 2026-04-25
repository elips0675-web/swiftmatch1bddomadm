// Frontend-only stub for the original "@/firebase" module.
// All hooks return safe defaults so UI renders without a backend.
import React, { createContext, useContext } from "react";

const Ctx = createContext<any>(null);

export const FirebaseClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Ctx.Provider value={null}>{children}</Ctx.Provider>;
};

export function useFirebase() {
  return null;
}
export function useFirestore() {
  return null;
}
export function useAuth() {
  return null;
}
export function useStorage() {
  return null;
}
export function useUser() {
  return { user: null, loading: false, error: null };
}
export function useDoc<T = any>(_ref: any) {
  return { data: null as T | null, loading: false, error: null };
}
export function useCollection<T = any>(_ref: any) {
  return { data: [] as T[], loading: false, error: null };
}
export function useMemoFirebase<T>(factory: () => T, _deps: any[]) {
  // Mimic the original signature; we just always recompute (safe for nulls).
  return factory();
}

export const errorEmitter = {
  on: (_: string, __: (...args: any[]) => void) => {},
  off: (_: string, __: (...args: any[]) => void) => {},
  emit: (_: string, ...__: any[]) => {},
};
