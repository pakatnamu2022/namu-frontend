// Fondo aleatorio del login vía Unsplash.
// Solo usa la Access Key (pública, client-side). 1 request por día por navegador.

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined;
const COLLECTIONS = (import.meta.env.VITE_UNSPLASH_COLLECTIONS as string | undefined)?.trim();
const QUERY = (import.meta.env.VITE_UNSPLASH_QUERY as string | undefined)?.trim();

const CACHE_KEY = "sian-login-bg";
const UTM = "utm_source=Sian&utm_medium=referral";

export interface LoginPhoto {
  /** URL lista para <img src>, recortada a paisaje. */
  imageUrl: string;
  /** Color dominante, sirve de placeholder mientras carga. */
  color: string;
  authorName: string;
  authorUrl: string;
  unsplashUrl: string;
}

interface CacheShape {
  date: string;
  photo: LoginPhoto;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readCache(): LoginPhoto | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (parsed.date !== today() || !parsed.photo?.imageUrl) return null;
    return parsed.photo;
  } catch {
    return null;
  }
}

function writeCache(photo: LoginPhoto): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today(), photo } satisfies CacheShape));
  } catch {
    /* storage lleno o bloqueado: no pasa nada */
  }
}

/** Unsplash exige disparar este endpoint cuando la foto se "usa". */
function trackDownload(downloadLocation: string): void {
  if (!downloadLocation || !ACCESS_KEY) return;
  fetch(`${downloadLocation}&client_id=${ACCESS_KEY}`).catch(() => {});
}

export async function fetchLoginPhoto(
  opts: { signal?: AbortSignal; force?: boolean } = {},
): Promise<LoginPhoto | null> {
  const { signal, force } = opts;
  if (!ACCESS_KEY) return null;

  if (!force) {
    const cached = readCache();
    if (cached) return cached;
  }

  const params = new URLSearchParams({
    orientation: "portrait",
    content_filter: "high",
    client_id: ACCESS_KEY,
  });
  if (COLLECTIONS) {
    params.set("collections", COLLECTIONS);
  } else if (QUERY) {
    // Unsplash trata `query` como una sola frase; elegimos un término al azar
    // de la lista para variar los resultados en cada carga.
    const terms = QUERY.split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    params.set("query", terms[Math.floor(Math.random() * terms.length)] ?? QUERY);
  }

  const res = await fetch(`https://api.unsplash.com/photos/random?${params.toString()}`, { signal });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);

  const data = await res.json();
  const raw: string = data?.urls?.raw ?? data?.urls?.regular;
  if (!raw) return null;

  const photo: LoginPhoto = {
    imageUrl: `${raw}${raw.includes("?") ? "&" : "?"}w=1400&h=1800&fit=crop&crop=entropy&q=80&fm=jpg`,
    color: data?.color ?? "#1E2430",
    authorName: data?.user?.name ?? "Unsplash",
    authorUrl: `${data?.user?.links?.html ?? "https://unsplash.com"}?${UTM}`,
    unsplashUrl: `${data?.links?.html ?? "https://unsplash.com"}?${UTM}`,
  };

  writeCache(photo);
  trackDownload(data?.links?.download_location);
  return photo;
}
