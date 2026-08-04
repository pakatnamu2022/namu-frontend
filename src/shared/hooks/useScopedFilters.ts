import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useScopedFiltersStore } from "@/shared/lib/scopedFilters.store";

/**
 * Mantiene un conjunto de valores (búsqueda, sede, etc.) vivos mientras el
 * usuario navega dentro de rutas hijas de `scopeKey` (ej. entra al detalle de
 * un movimiento y vuelve). En cuanto el pathname deja de empezar con
 * `scopeKey`, el scope se limpia solo para no filtrar el resto de la app.
 *
 * `scopeKey` debe ser la ruta absoluta base de la página (ej.
 * INVENTORY.ABSOLUTE_ROUTE) para que el reset se dispare al salir de ella.
 */
export function useScopedFilters<T extends Record<string, unknown>>(
  scopeKey: string,
  initialValues: T,
) {
  const { pathname } = useLocation();
  const { scopes, setValue, clearScope } = useScopedFiltersStore();

  const isInsideScope = pathname.startsWith(scopeKey);

  useEffect(() => {
    if (!isInsideScope) {
      clearScope(scopeKey);
    }
  }, [isInsideScope, scopeKey, clearScope]);

  const stored = scopes[scopeKey];
  const values = {
    ...initialValues,
    ...(isInsideScope ? stored : undefined),
  } as T;

  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    setValue(scopeKey, field as string, value);
  };

  return { values, setFieldValue };
}
