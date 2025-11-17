import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../features/auth/lib/auth.store";
import {
  findRouteInPermissions,
  getFirstChildRoute,
} from "../lib/routeGenerator";

/**
 * Componente que valida permisos y redirige a rutas dinámicas
 * Las páginas reales se cargan usando las rutas existentes de [company]/[module]/etc
 * Este componente maneja la validación de permisos y redirección
 */
export function DynamicPageValidator() {
  const { company, module, submodule } = useParams();
  const navigate = useNavigate();
  const permissions = useAuthStore((state) => state.permissions);

  useEffect(() => {
    if (!company || !module || !permissions) {
      return;
    }

    // Construir la ruta actual
    const parts = [company, module, submodule].filter(Boolean);
    const currentPath = `/${parts.join("/")}`;

    // Verificar si la ruta existe en los permisos
    const route = findRouteInPermissions(currentPath, permissions);

    if (!route) {
      // No tiene permisos, redirigir a 404
      navigate("/404", { replace: true });
      return;
    }

    // Si la ruta tiene hijos y no estamos en una vista específica,
    // redirigir al primer hijo disponible
    if (route.hasChildren) {
      const firstChild = getFirstChildRoute(
        company,
        module,
        submodule,
        permissions
      );

      if (firstChild) {
        navigate(firstChild, { replace: true });
        return;
      }
    }
  }, [company, module, submodule, permissions, navigate]);

  // Este componente solo valida, no renderiza nada
  return null;
}
