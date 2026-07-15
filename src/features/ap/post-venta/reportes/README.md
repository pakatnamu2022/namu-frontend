# Reportes de Post Venta

Punto único de entrada para todos los reportes de Post Venta (taller, repuestos, almacén, reportes para socios como DERCO, etc.) y, a futuro, dashboards del módulo.

Usa el mismo motor compartido que `comercial/reportes`: [`src/shared/lib/reports`](../../../../shared/lib/reports) / [`src/shared/components/reports`](../../../../shared/components/reports). Este módulo solo define **qué reportes existen** (`reports.constants.ts`); el motor (formulario dinámico, descarga, tipos) no se toca.

## Estructura

```
post-venta/reportes/
├── lib/
│   └── reports.constants.ts   # POST_VENTA_REPORTS: catálogo de reportes de Post Venta
├── index.ts                   # Exportaciones públicas
└── README.md
```

La página vive en `src/app/ap/post-venta/reportes/page.tsx` y renderiza `POST_VENTA_REPORTS` con `<ReportsGrid />`.

## Agregar un nuevo reporte

1. Confirma con backend el endpoint de export (`POST /ap/postVenta/reports/<algo>/export`) y qué parámetros acepta.
2. Agrega una entrada a `POST_VENTA_REPORTS` en [`reports.constants.ts`](lib/reports.constants.ts) con sus `fields` (texto, número, fecha, rango de fechas, select o multiselect — ver tipos en [`reports.interface.ts`](../../../../shared/lib/reports/reports.interface.ts)).
3. No hace falta tocar componentes ni rutas nuevas: la tarjeta y el formulario se generan solos a partir de la config.

Ejemplo (reporte de repuestos):

```typescript
{
  id: "spare-parts-consumption",
  title: "Consumo de Repuestos",
  type: "Repuestos",
  description: "Exporta el consumo de repuestos por almacén y rango de fechas.",
  icon: "PackageSearch",
  endpoint: "/ap/postVenta/reports/spare-parts/export",
  fields: [
    {
      name: "warehouse_id",
      label: "Almacén",
      type: "select",
      endpoint: "/ap/configuration/warehouse",
      optionsMapper: (data) =>
        (data?.data ?? []).map((item: any) => ({
          label: item.description,
          value: String(item.id),
        })),
    },
    {
      name: "date_range",
      label: "Rango de Fechas",
      type: "daterange",
      nameFrom: "date_from",
      nameTo: "date_to",
    },
  ],
}
```

## Reportes para socios (DERCO y similares)

Estos son reportes normales del catálogo — no hay un mecanismo especial. Si el formato/campos que exige la marca difiere mucho de un reporte interno, prefiere crear una entrada separada (`derco-warranty-claims`, por ejemplo) en vez de sobrecargar un reporte existente con parámetros condicionales.

Si en el futuro varios reportes son específicos de una sola marca/socio y crecen en número, agrupar por `type` (ej. `"DERCO"`) es suficiente para diferenciarlos visualmente en el grid; no se necesita una subcarpeta aparte a menos que también requieran lógica de UI propia.

## Dashboards

Cuando se necesiten dashboards (no solo exports), estos van en `src/app/ap/post-venta/reportes/dashboard/<nombre>/page.tsx`, como páginas independientes que consumen sus propios hooks/gráficos (ver [`src/shared/charts`](../../../../shared/charts)). No reutilizan el motor de `ReportConfig` (que es para exports configurables), pero sí pueden vivir bajo el mismo apartado de navegación "Reportes" para mantener todo centralizado.
