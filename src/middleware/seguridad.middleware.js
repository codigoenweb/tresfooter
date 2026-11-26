import rateLimit from 'express-rate-limit';


export function manualHelmet(peticion, respuesta, siguiente) {
  const isProduction = process.env.NODE_ENV === 'production';

  respuesta.setHeader('X-Content-Type-Options', 'nosniff');
  respuesta.setHeader('X-Frame-Options', 'SAMEORIGIN');
  respuesta.setHeader('X-XSS-Protection', '0');
  respuesta.setHeader('X-DNS-Prefetch-Control', 'off');
  respuesta.setHeader('Download-Options', 'noopen');
  respuesta.setHeader('Permitted-Cross-Domain-Policies', 'none');

  if (isProduction) {
    respuesta.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  const cspDirectives = [
    "default-src 'self'",
    "img-src 'self' https://images.unsplash.com https://placehold.co data:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "object-src 'none'",
    isProduction ? "upgrade-insecure-requests" : ""
  ].filter(Boolean).join('; ');

  respuesta.setHeader('Content-Security-Policy', cspDirectives);
  siguiente();
}
// Para limitar los ingresos generados por robots.

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Probá nuevamente en 15 minutos.' }
});


export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados envíos. Intentá más tarde.' }
});