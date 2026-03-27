/**
 * Vercel이 서버에서 직접 설정하는 x-real-ip를 우선 사용.
 * x-forwarded-for는 클라이언트가 임의로 설정 가능하므로 폴백으로만 사용.
 */
export function getIP(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ??
    "unknown"
  );
}
