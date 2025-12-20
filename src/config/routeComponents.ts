import { ComponentType } from 'react';

/**
 * Diccionario de componentes de rutas dinámicas
 * Mapea las rutas del backend (company/module/submodule/view) a los componentes de React
 *
 * Estructura de las keys:
 * - Módulo: "company/module" → Página del módulo
 * - Submódulo: "company/module/submodule" → Página del submódulo
 * - Vista: "company/module/submodule/view" → Página de vista específica
 *
 * NOTA: La mayoría de las rutas están comentadas porque ya se importan estáticamente en App.tsx
 * para mejor rendimiento en producción (evitar lazy loading delays).
 * Solo se mantienen activas las rutas dinámicas que NO están en App.tsx.
 */

type RouteComponent = ComponentType<any>;

export const routeComponents: Record<string, RouteComponent> = {
  // ======================================================
  // RUTAS COMENTADAS: Ya están importadas estáticamente en App.tsx
  // ======================================================

  // GP (Grupo Pakatnamú) - Gestión del Sistema
  // 'gp/gestion-del-sistema': lazy(() => import('@/app/gp/gestion-del-sistema/page')),
  // 'gp/gestion-del-sistema/usuarios': lazy(() => import('@/app/gp/gestion-del-sistema/usuarios/page')),
  // 'gp/gestion-del-sistema/usuarios/agregar': lazy(() => import('@/app/gp/gestion-del-sistema/usuarios/agregar/page')),
  // 'gp/gestion-del-sistema/usuarios/actualizar': lazy(() => import('@/app/gp/gestion-del-sistema/usuarios/actualizar/[id]/page')),
  // 'gp/gestion-del-sistema/roles': lazy(() => import('@/app/gp/gestion-del-sistema/roles/page')),
  // 'gp/gestion-del-sistema/roles/permisos': lazy(() => import('@/app/gp/gestion-del-sistema/roles/permisos/[id]/page')),
  // 'gp/gestion-del-sistema/vistas': lazy(() => import('@/app/gp/gestion-del-sistema/vistas/page')),
  // 'gp/gestion-del-sistema/vistas/agregar': lazy(() => import('@/app/gp/gestion-del-sistema/vistas/agregar/page')),
  // 'gp/gestion-del-sistema/vistas/actualizar': lazy(() => import('@/app/gp/gestion-del-sistema/vistas/actualizar/[id]/page')),
  // 'gp/gestion-del-sistema/vistas/permisos': lazy(() => import('@/app/gp/gestion-del-sistema/vistas/permisos/[id]/page')),

  // GP - Gestión Humana
  // 'gp/gestion-humana': lazy(() => import('@/app/gp/gestion-humana/page')),
  // 'gp/gestion-humana/personal/trabajadores': lazy(() => import('@/app/gp/gestion-humana/gestion-de-personal/trabajadores/page')),
  // 'gp/gestion-humana/configuraciones/posiciones': lazy(() => import('@/app/gp/gestion-humana/configuraciones/posiciones/page')),
  // 'gp/gestion-humana/configuraciones/posiciones/agregar': lazy(() => import('@/app/gp/gestion-humana/configuraciones/posiciones/agregar/page')),
  // 'gp/gestion-humana/configuraciones/posiciones/actualizar': lazy(() => import('@/app/gp/gestion-humana/configuraciones/posiciones/actualizar/[id]/page')),

  // Evaluaciones de Desempeño
  // 'gp/gestion-humana/evaluaciones-de-desempeno': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/categorias-jerarquicas/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/ciclos': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/ciclos/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/ciclos/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/ciclos/detalle': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/ciclos/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/competencias': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/competencias/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/competencias/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/competencias/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalle': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/persona': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/evaluaciones/detalles/[id]/[person]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/excluidos': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/excluidos/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/metricas': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/metricas/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/metricas/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/metricas/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/objetivos': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/objetivos/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/objetivos/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/objetivos/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/parametros': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/parametros/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/parametros/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/parametros/actualizar/[id]/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/periodos': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/periodos/agregar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/agregar/page')),
  // 'gp/gestion-humana/evaluaciones-de-desempeno/periodos/actualizar': lazy(() => import('@/app/gp/gestion-humana/evaluaciones-de-desempeno/periodos/actualizar/[id]/page')),

  // GP - Maestro General
  // 'gp/maestro-general/sede': lazy(() => import('@/app/gp/maestro-general/sede/page')),
  // 'gp/maestro-general/sede/agregar': lazy(() => import('@/app/gp/maestro-general/sede/agregar/page')),
  // 'gp/maestro-general/sede/actualizar': lazy(() => import('@/app/gp/maestro-general/sede/actualizar/[id]/page')),

  // GP - TICS
  // 'gp/tics': lazy(() => import('@/app/gp/tics/page')),
  // 'gp/tics/auditoria': lazy(() => import('@/app/gp/tics/auditoria/page')),
  // 'gp/tics/equipos': lazy(() => import('@/app/gp/tics/equipos/page')),
  // 'gp/tics/equipos/agregar': lazy(() => import('@/app/gp/tics/equipos/agregar/page')),
  // 'gp/tics/equipos/actualizar': lazy(() => import('@/app/gp/tics/equipos/actualizar/[id]/page')),

  // AP (Automotores Pakatnamú) - Comercial
  // 'ap/comercial/agenda': lazy(() => import('@/app/ap/comercial/agenda/page')),
  // 'ap/comercial/agenda/oportunidades': lazy(() => import('@/app/ap/comercial/agenda/oportunidades/page')),
  // 'ap/comercial/agenda/oportunidades/agregar': lazy(() => import('@/app/ap/comercial/agenda/oportunidades/agregar/page')),
  // 'ap/comercial/agenda/oportunidades/actualizar': lazy(() => import('@/app/ap/comercial/agenda/oportunidades/actualizar/[id]/page')),
  // 'ap/comercial/agenda/oportunidades/detalle': lazy(() => import('@/app/ap/comercial/agenda/oportunidades/[id]/page')),
  // 'ap/comercial/clientes': lazy(() => import('@/app/ap/comercial/clientes/page')),
  // 'ap/comercial/clientes/agregar': lazy(() => import('@/app/ap/comercial/clientes/agregar/page')),
  // 'ap/comercial/clientes/actualizar': lazy(() => import('@/app/ap/comercial/clientes/actualizar/[id]/page')),
  // 'ap/comercial/clientes/establecimientos': lazy(() => import('@/app/ap/comercial/clientes/establecimientos/[id]/page')),
  // 'ap/comercial/clientes/establecimientos/agregar': lazy(() => import('@/app/ap/comercial/clientes/establecimientos/[id]/agregar/page')),
  // 'ap/comercial/clientes/establecimientos/actualizar': lazy(() => import('@/app/ap/comercial/clientes/establecimientos/[id]/actualizar/[establishmentId]/page')),
  // 'ap/comercial/compra-vehiculo-nuevo': lazy(() => import('@/app/ap/comercial/compra-vehiculo-nuevo/page')),
  // 'ap/comercial/compra-vehiculo-nuevo/agregar': lazy(() => import('@/app/ap/comercial/compra-vehiculo-nuevo/agregar/page')),
  // 'ap/comercial/compra-vehiculo-nuevo/reenviar': lazy(() => import('@/app/ap/comercial/compra-vehiculo-nuevo/reenviar/[id]/page')),
  // 'ap/comercial/dashboard-visitas-leads': lazy(() => import('@/app/ap/comercial/dashboard-visitas-leads/page')),
  // 'ap/comercial/electronic-documents': lazy(() => import('@/app/ap/comercial/electronic-documents/page')),
  // 'ap/comercial/electronic-documents/agregar': lazy(() => import('@/app/ap/comercial/electronic-documents/agregar/page')),
  // 'ap/comercial/electronic-documents/actualizar': lazy(() => import('@/app/ap/comercial/electronic-documents/actualizar/[id]/page')),
  // 'ap/comercial/electronic-documents/credit-note': lazy(() => import('@/app/ap/comercial/electronic-documents/[id]/credit-note/page')),
  // 'ap/comercial/electronic-documents/credit-note/actualizar': lazy(() => import('@/app/ap/comercial/electronic-documents/[id]/credit-note/actualizar/[credit]/page')),
  // 'ap/comercial/electronic-documents/debit-note': lazy(() => import('@/app/ap/comercial/electronic-documents/[id]/debit-note/page')),
  // 'ap/comercial/electronic-documents/debit-note/actualizar': lazy(() => import('@/app/ap/comercial/electronic-documents/[id]/debit-note/actualizar/[debit]/page')),
  // 'ap/comercial/entrega-vehiculo': lazy(() => import('@/app/ap/comercial/entrega-vehiculo/page')),
  // 'ap/comercial/entrega-vehiculo/agregar': lazy(() => import('@/app/ap/comercial/entrega-vehiculo/agregar/page')),
  // 'ap/comercial/entrega-vehiculo/guia-remision': lazy(() => import('@/app/ap/comercial/entrega-vehiculo/guia-remision/[id]/page')),
  // 'ap/comercial/envios-recepciones': lazy(() => import('@/app/ap/comercial/envios-recepciones/page')),
  // 'ap/comercial/envios-recepciones/agregar': lazy(() => import('@/app/ap/comercial/envios-recepciones/agregar/page')),
  // 'ap/comercial/envios-recepciones/actualizar': lazy(() => import('@/app/ap/comercial/envios-recepciones/actualizar/[id]/page')),
  // 'ap/comercial/envios-recepciones/checklist': lazy(() => import('@/app/ap/comercial/envios-recepciones/checklist/[id]/page')),
  // 'ap/comercial/gestionar-leads': lazy(() => import('@/app/ap/comercial/gestionar-leads/page')),
  // 'ap/comercial/motivos-descarte': lazy(() => import('@/app/ap/comercial/motivos-descarte/page')),
  // 'ap/comercial/proveedores': lazy(() => import('@/app/ap/comercial/proveedores/page')),
  // 'ap/comercial/proveedores/agregar': lazy(() => import('@/app/ap/comercial/proveedores/agregar/page')),
  // 'ap/comercial/proveedores/actualizar': lazy(() => import('@/app/ap/comercial/proveedores/actualizar/[id]/page')),
  // 'ap/comercial/proveedores/establecimientos': lazy(() => import('@/app/ap/comercial/proveedores/establecimientos/[id]/page')),
  // 'ap/comercial/proveedores/establecimientos/agregar': lazy(() => import('@/app/ap/comercial/proveedores/establecimientos/[id]/agregar/page')),
  // 'ap/comercial/proveedores/establecimientos/actualizar': lazy(() => import('@/app/ap/comercial/proveedores/establecimientos/[id]/actualizar/[establishmentId]/page')),
  // 'ap/comercial/solicitudes-cotizaciones': lazy(() => import('@/app/ap/comercial/solicitudes-cotizaciones/page')),
  // 'ap/comercial/solicitudes-cotizaciones/agregar': lazy(() => import('@/app/ap/comercial/solicitudes-cotizaciones/agregar/page')),
  // 'ap/comercial/solicitudes-cotizaciones/actualizar': lazy(() => import('@/app/ap/comercial/solicitudes-cotizaciones/actualizar/[id]/page')),
  // 'ap/comercial/vehiculos': lazy(() => import('@/app/ap/comercial/vehiculos/page')),
  // 'ap/comercial/visitas-tienda': lazy(() => import('@/app/ap/comercial/visitas-tienda/page')),
  // 'ap/comercial/visitas-tienda/agregar': lazy(() => import('@/app/ap/comercial/visitas-tienda/agregar/page')),
  // 'ap/comercial/visitas-tienda/actualizar': lazy(() => import('@/app/ap/comercial/visitas-tienda/actualizar/[id]/page')),

  // AP - Configuraciones - Maestros General
  // 'ap/configuraciones/maestros-general/actividad-economica': lazy(() => import('@/app/ap/configuraciones/maestros-general/actividad-economica/page')),
  // 'ap/configuraciones/maestros-general/almacenes': lazy(() => import('@/app/ap/configuraciones/maestros-general/almacenes/page')),
  // 'ap/configuraciones/maestros-general/almacenes/agregar': lazy(() => import('@/app/ap/configuraciones/maestros-general/almacenes/agregar/page')),
  // 'ap/configuraciones/maestros-general/almacenes/actualizar': lazy(() => import('@/app/ap/configuraciones/maestros-general/almacenes/actualizar/[id]/page')),
  // 'ap/configuraciones/maestros-general/asignar-serie-usuario': lazy(() => import('@/app/ap/configuraciones/maestros-general/asignar-serie-usuario/page')),
  // 'ap/configuraciones/maestros-general/asignar-serie-usuario/agregar': lazy(() => import('@/app/ap/configuraciones/maestros-general/asignar-serie-usuario/agregar/page')),
  // 'ap/configuraciones/maestros-general/asignar-serie-usuario/actualizar': lazy(() => import('@/app/ap/configuraciones/maestros-general/asignar-serie-usuario/actualizar/[id]/page')),
  // 'ap/configuraciones/maestros-general/asignar-serie-venta': lazy(() => import('@/app/ap/configuraciones/maestros-general/asignar-serie-venta/page')),
  // 'ap/configuraciones/maestros-general/asignar-serie-venta/agregar': lazy(() => import('@/app/ap/configuraciones/maestros-general/asignar-serie-venta/agregar/page')),
  // 'ap/configuraciones/maestros-general/asignar-serie-venta/actualizar': lazy(() => import('@/app/ap/configuraciones/maestros-general/asignar-serie-venta/actualizar/[id]/page')),
  // 'ap/configuraciones/maestros-general/bancos': lazy(() => import('@/app/ap/configuraciones/maestros-general/bancos/page')),
  // 'ap/configuraciones/maestros-general/chequeras': lazy(() => import('@/app/ap/configuraciones/maestros-general/chequeras/page')),
  // 'ap/configuraciones/maestros-general/chequeras/agregar': lazy(() => import('@/app/ap/configuraciones/maestros-general/chequeras/agregar/page')),
  // 'ap/configuraciones/maestros-general/chequeras/actualizar': lazy(() => import('@/app/ap/configuraciones/maestros-general/chequeras/actualizar/[id]/page')),
  // 'ap/configuraciones/maestros-general/clase-articulo': lazy(() => import('@/app/ap/configuraciones/maestros-general/clase-articulo/page')),
  // 'ap/configuraciones/maestros-general/clase-articulo/agregar': lazy(() => import('@/app/ap/configuraciones/maestros-general/clase-articulo/agregar/page')),
  // 'ap/configuraciones/maestros-general/clase-articulo/actualizar': lazy(() => import('@/app/ap/configuraciones/maestros-general/clase-articulo/actualizar/[id]/page')),
  // 'ap/configuraciones/maestros-general/estado-civil': lazy(() => import('@/app/ap/configuraciones/maestros-general/estado-civil/page')),
  // 'ap/configuraciones/maestros-general/origen-cliente': lazy(() => import('@/app/ap/configuraciones/maestros-general/origen-cliente/page')),
  // 'ap/configuraciones/maestros-general/plan-cuenta-contable': lazy(() => import('@/app/ap/configuraciones/maestros-general/plan-cuenta-contable/page')),
  // 'ap/configuraciones/maestros-general/segmentos-persona': lazy(() => import('@/app/ap/configuraciones/maestros-general/segmentos-persona/page')),
  // 'ap/configuraciones/maestros-general/tipos-clase-impuesto': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-clase-impuesto/page')),
  // 'ap/configuraciones/maestros-general/tipos-comprobante': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-comprobante/page')),
  // 'ap/configuraciones/maestros-general/tipos-cuenta-contable': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-cuenta-contable/page')),
  // 'ap/configuraciones/maestros-general/tipos-documento': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-documento/page')),
  // 'ap/configuraciones/maestros-general/tipos-moneda': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-moneda/page')),
  // 'ap/configuraciones/maestros-general/tipos-operacion': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-operacion/page')),
  // 'ap/configuraciones/maestros-general/tipos-persona': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-persona/page')),
  // 'ap/configuraciones/maestros-general/tipos-sexo': lazy(() => import('@/app/ap/configuraciones/maestros-general/tipos-sexo/page')),
  // 'ap/configuraciones/maestros-general/ubigeos': lazy(() => import('@/app/ap/configuraciones/maestros-general/ubigeos/page')),
  // 'ap/configuraciones/maestros-general/ubigeos/agregar': lazy(() => import('@/app/ap/configuraciones/maestros-general/ubigeos/agregar/page')),
  // 'ap/configuraciones/maestros-general/ubigeos/actualizar': lazy(() => import('@/app/ap/configuraciones/maestros-general/ubigeos/actualizar/[id]/page')),
  // 'ap/configuraciones/maestros-general/unidad-medida': lazy(() => import('@/app/ap/configuraciones/maestros-general/unidad-medida/page')),

  // AP - Configuraciones - Vehículos
  // 'ap/configuraciones/vehiculos/categorias': lazy(() => import('@/app/ap/configuraciones/vehiculos/categorias/page')),
  // 'ap/configuraciones/vehiculos/categorias-checklist': lazy(() => import('@/app/ap/configuraciones/vehiculos/categorias-checklist/page')),
  // 'ap/configuraciones/vehiculos/checklist-entrega': lazy(() => import('@/app/ap/configuraciones/vehiculos/checklist-entrega/page')),
  // 'ap/configuraciones/vehiculos/checklist-recepcion': lazy(() => import('@/app/ap/configuraciones/vehiculos/checklist-recepcion/page')),
  // 'ap/configuraciones/vehiculos/colores-vehiculo': lazy(() => import('@/app/ap/configuraciones/vehiculos/colores-vehiculo/page')),
  // 'ap/configuraciones/vehiculos/estados-vehiculo': lazy(() => import('@/app/ap/configuraciones/vehiculos/estados-vehiculo/page')),
  // 'ap/configuraciones/vehiculos/estados-vehiculo/agregar': lazy(() => import('@/app/ap/configuraciones/vehiculos/estados-vehiculo/agregar/page')),
  // 'ap/configuraciones/vehiculos/estados-vehiculo/actualizar': lazy(() => import('@/app/ap/configuraciones/vehiculos/estados-vehiculo/actualizar/[id]/page')),
  // 'ap/configuraciones/vehiculos/familias': lazy(() => import('@/app/ap/configuraciones/vehiculos/familias/page')),
  // 'ap/configuraciones/vehiculos/grupo-marcas': lazy(() => import('@/app/ap/configuraciones/vehiculos/grupo-marcas/page')),
  // 'ap/configuraciones/vehiculos/marcas': lazy(() => import('@/app/ap/configuraciones/vehiculos/marcas/page')),
  // 'ap/configuraciones/vehiculos/marcas/agregar': lazy(() => import('@/app/ap/configuraciones/vehiculos/marcas/agregar/page')),
  // 'ap/configuraciones/vehiculos/marcas/actualizar': lazy(() => import('@/app/ap/configuraciones/vehiculos/marcas/actualizar/[id]/page')),
  // 'ap/configuraciones/vehiculos/modelos-vn': lazy(() => import('@/app/ap/configuraciones/vehiculos/modelos-vn/page')),
  // 'ap/configuraciones/vehiculos/modelos-vn/agregar': lazy(() => import('@/app/ap/configuraciones/vehiculos/modelos-vn/agregar/page')),
  // 'ap/configuraciones/vehiculos/modelos-vn/actualizar': lazy(() => import('@/app/ap/configuraciones/vehiculos/modelos-vn/actualizar/[id]/page')),
  // 'ap/configuraciones/vehiculos/origen-vehiculo': lazy(() => import('@/app/ap/configuraciones/vehiculos/origen-vehiculo/page')),
  // 'ap/configuraciones/vehiculos/tipos-carroceria': lazy(() => import('@/app/ap/configuraciones/vehiculos/tipos-carroceria/page')),
  // 'ap/configuraciones/vehiculos/tipos-combustible': lazy(() => import('@/app/ap/configuraciones/vehiculos/tipos-combustible/page')),
  // 'ap/configuraciones/vehiculos/tipos-motor': lazy(() => import('@/app/ap/configuraciones/vehiculos/tipos-motor/page')),
  // 'ap/configuraciones/vehiculos/tipos-pedido-proveedor': lazy(() => import('@/app/ap/configuraciones/vehiculos/tipos-pedido-proveedor/page')),
  // 'ap/configuraciones/vehiculos/tipos-producto': lazy(() => import('@/app/ap/configuraciones/vehiculos/tipos-producto/page')),
  // 'ap/configuraciones/vehiculos/tipos-vehiculo': lazy(() => import('@/app/ap/configuraciones/vehiculos/tipos-vehiculo/page')),
};

/**
 * Busca un componente en el diccionario por la ruta actual
 * @param company - Slug de la empresa (ej: "gp", "ap")
 * @param module - Slug del módulo (ej: "gestion-del-sistema")
 * @param submodule - Slug del submódulo (opcional)
 * @param view - Slug de la vista (opcional)
 * @returns El componente correspondiente o undefined si no existe
 */
export function findComponentByRoute(
  company: string,
  module?: string,
  submodule?: string,
  view?: string
): RouteComponent | undefined {
  // Construir la clave de búsqueda
  const parts = [company, module, submodule, view].filter(Boolean);
  const routeKey = parts.join('/');

  return routeComponents[routeKey];
}

/**
 * Verifica si existe un componente registrado para una ruta
 */
export function hasComponent(routeKey: string): boolean {
  return routeKey in routeComponents;
}
