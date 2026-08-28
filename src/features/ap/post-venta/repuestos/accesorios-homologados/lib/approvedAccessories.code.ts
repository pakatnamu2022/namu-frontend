/**
 * Vista previa del código autogenerado de un accesorio homologado.
 *
 * Debe reflejar la misma regla que el backend
 * (App\Http\Utils\AccessoryCodeGenerator): iniciales de las palabras
 * significativas; si hay una sola, sus primeras 3 letras. El backend es la
 * fuente de verdad y además resuelve colisiones agregando un sufijo numérico,
 * cosa que aquí no se hace (solo es una vista previa).
 */
const STOPWORDS = new Set([
  "DE", "DEL", "LA", "LAS", "EL", "LOS", "Y", "O", "U", "A", "EN",
  "PARA", "CON", "SIN", "POR", "SOBRE", "ANTE", "TRAS", "AL",
]);

const DIACRITICS = /[̀-ͯ]/g;

export function previewAccessoryCode(description: string): string {
  const normalized = (description ?? "")
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toUpperCase()
    .trim();

  const words = normalized.split(/[^A-Z0-9]+/).filter(Boolean);
  const significant = words.filter((w) => !STOPWORDS.has(w));

  let code: string;
  if (significant.length >= 2) {
    code = significant.map((w) => w[0]).join("");
  } else if (significant.length === 1) {
    code = significant[0].slice(0, 3);
  } else if (words.length > 0) {
    code = words[0].slice(0, 3);
  } else {
    code = "";
  }

  return code.slice(0, 18);
}
