import { useNavigate, useLocation, useParams as useRouterParams, useSearchParams as useRouterSearchParams } from "react-router-dom";

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: (_: string) => {},
    pathname: location.pathname,
    query: {} as Record<string, string>,
  };
}

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  const [params] = useRouterSearchParams();
  return params;
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useRouterParams() as T;
}

export function redirect(href: string): never {
  if (typeof window !== "undefined") {
    window.location.href = href;
  }
  throw new Error("redirect:" + href);
}

export function notFound(): never {
  throw new Error("NEXT_NOT_FOUND");
}
