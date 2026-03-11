/**
 * Green Score Calculator - Algoritmo de Puntuación Verde
 *
 * Puntaje 0-100 basado en:
 * - Proximidad (30%): distancia entre marca y fabricante (Haversine)
 * - Materiales (35%): porcentaje de materiales reciclados
 * - Certificaciones (25%): cantidad y tipo de certificaciones vigentes
 * - Historial (10%): rating promedio de contratos anteriores
 */

const WEIGHTS = {
  proximity: 0.30,
  materials: 0.35,
  certifications: 0.25,
  history: 0.10,
} as const;

// Puntos por tipo de certificación
const CERT_SCORES: Record<string, number> = {
  GOTS: 30,
  "OEKO-TEX": 25,
  "OEKO-TEX Standard 100": 25,
  BCI: 20,
  "BCI (Better Cotton Initiative)": 20,
  GRS: 28,
  "GRS (Global Recycled Standard)": 28,
  "Fair Trade": 22,
  "ISO 9001": 10,
  "ISO 9001:2015": 10,
};

/**
 * Fórmula de Haversine para distancia en km entre dos coords.
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function proximityScore(distanceKm: number | null): number {
  if (distanceKm === null) return 50; // Sin datos → puntaje neutro
  if (distanceKm < 50) return 100;
  if (distanceKm < 200) return 75;
  if (distanceKm < 500) return 50;
  return 25;
}

function materialsScore(recycledPercentage: number): number {
  return Math.min(100, recycledPercentage * 1.5); // 67%+ reciclado = 100
}

function certificationsScore(certNames: string[]): { score: number; details: string[] } {
  if (certNames.length === 0) return { score: 0, details: [] };

  let total = 0;
  const details: string[] = [];
  for (const name of certNames) {
    const pts = Object.entries(CERT_SCORES).find(
      ([key]) => name.toLowerCase().includes(key.toLowerCase())
    )?.[1] ?? 15;
    total += pts;
    details.push(name);
  }
  return { score: Math.min(100, total), details };
}

function historyScore(avgRating: number): number {
  return avgRating * 20; // 5.0 → 100
}

export interface GreenScoreInput {
  distanceKm: number | null;
  recycledPercentage: number;
  certifications: string[];
  avgRating: number;
}

export interface GreenScoreResult {
  total: number;
  proximity: { score: number; weight: number; distanceKm: number | null };
  materials: { score: number; weight: number; recycledPercentage: number };
  certifications: { score: number; weight: number; count: number; details: string[] };
  history: { score: number; weight: number; avgRating: number };
}

export function calculateGreenScore(input: GreenScoreInput): GreenScoreResult {
  const prox = proximityScore(input.distanceKm);
  const mats = materialsScore(input.recycledPercentage);
  const certs = certificationsScore(input.certifications);
  const hist = historyScore(input.avgRating);

  const total = Math.round(
    (prox * WEIGHTS.proximity +
      mats * WEIGHTS.materials +
      certs.score * WEIGHTS.certifications +
      hist * WEIGHTS.history) * 100
  ) / 100;

  return {
    total,
    proximity: { score: prox, weight: WEIGHTS.proximity, distanceKm: input.distanceKm },
    materials: { score: mats, weight: WEIGHTS.materials, recycledPercentage: input.recycledPercentage },
    certifications: { score: certs.score, weight: WEIGHTS.certifications, count: input.certifications.length, details: certs.details },
    history: { score: hist, weight: WEIGHTS.history, avgRating: input.avgRating },
  };
}
