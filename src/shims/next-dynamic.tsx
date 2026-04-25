import React, { lazy, Suspense, ComponentType } from "react";

interface DynamicOptions {
  ssr?: boolean;
  loading?: () => React.ReactNode;
  suspense?: boolean;
}

export default function dynamic<P = any>(
  importFn: () => Promise<{ default: ComponentType<P> } | ComponentType<P>>,
  options: DynamicOptions = {},
) {
  const Lazy = lazy(async () => {
    const mod: any = await importFn();
    if (mod && typeof mod === "object" && "default" in mod) return mod;
    return { default: mod };
  });
  const Loading = options.loading ?? (() => null);
  const Wrapped: React.FC<P> = (props: any) => (
    <Suspense fallback={<Loading />}>
      <Lazy {...props} />
    </Suspense>
  );
  Wrapped.displayName = "DynamicComponent";
  return Wrapped as unknown as ComponentType<P>;
}
