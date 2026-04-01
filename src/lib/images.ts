/**
 * Central image registry for FashionsDen.
 *
 * HOW TO SWITCH TO CLOUDINARY:
 * 1. Upload all files from /public/images/ to Cloudinary (folder: fashionsden/)
 * 2. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env and Railway
 * 3. Each entry below will automatically switch to the CDN URL.
 *
 * Asset map (FashionsDen/ → public/images/brand/):
 *   FashionsDen_Negro.png → logo-dark.png   (negro, fondo blanco)
 *   FashionsDen_Blanco.png → logo-light.png  (blanco, fondo oscuro/lila)
 *   FashionsDen_1.png    → logo-color.png   (azul claro, variante color)
 *   FD_Negro.png         → icon-dark.png    (ícono negro, sidebar)
 *   FD_1.png             → icon-color.png   (ícono azul claro)
 *   FD_Blanco.png        → icon-light.png   (ícono blanco)
 */

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const cdnBase = CLOUD ? `https://res.cloudinary.com/${CLOUD}/image/upload/fashionsden` : null;

function img(localPath: string, cloudinaryPublicId: string): string {
  if (cdnBase) return `${cdnBase}/${cloudinaryPublicId}`;
  return localPath;
}

export const images = {
  // Logo negro — para fondos blancos (header, login, register, forgot/reset password)
  logo:        img("/images/brand/logo-dark.png",   "logo-dark.png"),
  logoDark:    img("/images/brand/logo-dark.png",   "logo-dark.png"),

  // Logo blanco — para fondos oscuros (footer lila)
  logoLight:   img("/images/brand/logo-light.png",  "logo-light.png"),

  // Logo azul claro — variante de color
  logoColor:   img("/images/brand/logo-color.png",  "logo-color.png"),

  // Ícono negro — sidebar colapsado
  iconPrimary: img("/images/brand/icon-dark.png",   "icon-dark.png"),
  iconDark:    img("/images/brand/icon-dark.png",   "icon-dark.png"),

  // Ícono azul claro / blanco
  iconColor:   img("/images/brand/icon-color.png",  "icon-color.png"),
  iconLight:   img("/images/brand/icon-light.png",  "icon-light.png"),

  // Mockups / Product
  mockupGorra:   img("/images/mockups/gorra.jpg",   "gorra.jpg"),
  mockupTotebag: img("/images/mockups/totebag.jpg", "totebag.jpg"),
} as const;
