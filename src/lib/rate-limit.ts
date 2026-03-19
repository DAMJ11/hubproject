/**
 * Rate limiter en memoria para endpoints sensibles.
 * Almacena intentos por clave (IP) con limpieza automática.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpieza periódica cada 5 minutos
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Verifica si una clave (ej: IP) ha excedido el límite de intentos.
 * @returns `{ allowed: true }` si puede continuar, o `{ allowed: false, retryAfterSeconds }` si excedió.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: true } | { allowed: false; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Extrae la IP del request (compatible con proxies).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
