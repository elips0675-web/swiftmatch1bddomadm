// Minimal stubs
export class NextRequest extends Request {}
export class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers || {}) },
    });
  }
  static redirect(url: string | URL, status = 307) {
    return new Response(null, { status, headers: { Location: url.toString() } });
  }
}
