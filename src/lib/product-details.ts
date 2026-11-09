/**
 * Medidas y contenido de un producto, guardados como texto simple (editable desde el admin).
 *
 * measurements:
 *   Ancho: 46 cm
 *   Alto: 38 cm
 *   Bolsillo exterior:      ← una línea que termina en ":" abre un grupo
 *   Ancho: 32 cm
 *
 * includes: un elemento por línea (se ignoran guiones o viñetas al principio).
 */

export type MeasurementGroup = {
  title: string | null;
  rows: { label: string; value: string }[];
};

export function parseMeasurements(text: string | null | undefined): MeasurementGroup[] {
  if (!text?.trim()) return [];

  const groups: MeasurementGroup[] = [];
  let current: MeasurementGroup = { title: null, rows: [] };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^[\s\-•·*]+/, "").trim();
    if (!line) continue;

    if (line.endsWith(":")) {
      if (current.rows.length > 0 || current.title) groups.push(current);
      current = { title: line.slice(0, -1).trim(), rows: [] };
      continue;
    }

    const idx = line.indexOf(":");
    if (idx > 0) {
      current.rows.push({ label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() });
    } else {
      current.rows.push({ label: line, value: "" });
    }
  }

  if (current.rows.length > 0) groups.push(current);
  return groups.filter((g) => g.rows.length > 0);
}

export function parseIncludes(text: string | null | undefined): string[] {
  if (!text?.trim()) return [];
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s\-•·*]+/, "").trim())
    .filter(Boolean);
}
