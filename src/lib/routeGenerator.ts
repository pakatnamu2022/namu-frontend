import type {
  ViewsResponseOpcionesMenu,
  ViewsResponseMenuChild,
} from "../features/views/lib/views.interface";

export interface DynamicRoute {
  path: string;
  company: string;
  module?: string;
  submodule?: string;
  view?: string;
  slug: string;
  description: string;
  hasChildren: boolean;
}

/**
 * Genera rutas planas desde el árbol de permisos del backend
 * @param permissions - Array de permisos desde access_tree
 * @returns Array de rutas dinámicas
 */
export function generateRoutesFromPermissions(
  permissions: ViewsResponseOpcionesMenu[]
): DynamicRoute[] {
  const routes: DynamicRoute[] = [];

  permissions.forEach((company) => {
    const companySlug = company.empresa_abreviatura.toLowerCase();

    company.menu.forEach((module) => {
      // Solo actualizar si tiene slug
      if (!module.slug) return;

      const moduleSlug = module.slug;
      const modulePath = `/${companySlug}/${moduleSlug}`;

      // Agregar ruta del módulo
      routes.push({
        path: modulePath,
        company: companySlug,
        module: moduleSlug,
        slug: moduleSlug,
        description: module.descripcion,
        hasChildren: module.children.length > 0,
      });

      // Procesar hijos (submódulos/vistas)
      processChildren(
        module.children,
        routes,
        companySlug,
        moduleSlug,
        modulePath
      );
    });
  });

  return routes;
}

/**
 * Procesa recursivamente los hijos de un módulo
 */
function processChildren(
  children: ViewsResponseMenuChild[],
  routes: DynamicRoute[],
  company: string,
  module: string,
  basePath: string,
  parentSlug?: string
) {
  children.forEach((child) => {
    // Determinar el slug del hijo
    const childSlug = child.slug || child.route;
    if (!childSlug) return;

    const childPath = `${basePath}/${childSlug}`;

    // Determinar si es submódulo o vista basándose en si tiene hijos
    const hasChildren = child.children && child.children.length > 0;

    if (hasChildren) {
      // Es un submódulo
      routes.push({
        path: childPath,
        company,
        module,
        submodule: childSlug,
        slug: childSlug,
        description: child.descripcion,
        hasChildren: true,
      });

      // Procesar sus hijos como vistas
      processChildren(
        child.children,
        routes,
        company,
        module,
        childPath,
        childSlug
      );
    } else {
      // Es una vista final
      if (parentSlug) {
        // Vista dentro de un submódulo
        routes.push({
          path: childPath,
          company,
          module,
          submodule: parentSlug,
          view: childSlug,
          slug: childSlug,
          description: child.descripcion,
          hasChildren: false,
        });
      } else {
        // Vista directa del módulo
        routes.push({
          path: childPath,
          company,
          module,
          view: childSlug,
          slug: childSlug,
          description: child.descripcion,
          hasChildren: false,
        });
      }
    }
  });
}


/**
 * Verifica si una ruta existe en los permisos del usuario
 */
export function routeExistsInPermissions(
  path: string,
  permissions: ViewsResponseOpcionesMenu[]
): boolean {
  const routes = generateRoutesFromPermissions(permissions);
  return routes.some((route) => route.path === path);
}

/**
 * Encuentra una ruta en los permisos del usuario
 */
export function findRouteInPermissions(
  path: string,
  permissions: ViewsResponseOpcionesMenu[]
): DynamicRoute | undefined {
  const routes = generateRoutesFromPermissions(permissions);
  return routes.find((route) => route.path === path);
}

/**
 * Obtiene el primer hijo disponible de una ruta
 * Útil para redirigir automáticamente cuando se accede a un módulo/submódulo
 */
export function getFirstChildRoute(
  company: string,
  module: string,
  submodule: string | undefined,
  permissions: ViewsResponseOpcionesMenu[]
): string | null {
  const basePath = submodule
    ? `/${company}/${module}/${submodule}`
    : `/${company}/${module}`;

  const routes = generateRoutesFromPermissions(permissions);

  // Buscar la primera ruta que sea hija directa del path base
  const childRoute = routes.find(
    (route) =>
      route.path.startsWith(basePath + "/") &&
      route.path.split("/").length === basePath.split("/").length + 1 &&
      !route.hasChildren
  );

  return childRoute?.path || null;
}
