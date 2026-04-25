
import { useState, useEffect } from 'react';

/**
 * A helper component that only renders its children on the client-side.
 * Used to avoid hydration mismatches for components that rely on browser APIs.
 */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return <>{children}</>;
}
