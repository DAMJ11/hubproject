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

function resolveCloudinaryCloudName(rawValue: string | undefined): string | null {
  if (!rawValue) return null;

  const value = rawValue.trim();
  if (!value) return null;

  // Supports plain cloud name, full Cloudinary URL, or legacy values with extra path parts.
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.hostname !== "res.cloudinary.com") return null;
      const [cloudName] = url.pathname.split("/").filter(Boolean);
      return cloudName && /^[a-z0-9_-]+$/i.test(cloudName) ? cloudName : null;
    } catch {
      return null;
    }
  }

  const [cloudName] = value.split("/").filter(Boolean);
  return cloudName && /^[a-z0-9_-]+$/i.test(cloudName) ? cloudName : null;
}

const cloudName = resolveCloudinaryCloudName(CLOUD);
const cdnBase = cloudName ? `https://res.cloudinary.com/${cloudName}/image/upload/fashionsden` : null;

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
