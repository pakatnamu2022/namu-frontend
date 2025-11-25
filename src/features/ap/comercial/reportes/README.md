# Sistema de Reportes Comerciales

Sistema flexible y reutilizable para generar reportes en el módulo comercial con soporte para múltiples formatos (Excel, PDF) y filtros configurables.

## Estructura

```
reportes/
├── components/
│   ├── ReportCard.tsx          # Tarjeta individual de reporte
│   └── ReportFilters.tsx       # Formulario de filtros dinámico
├── lib/
│   ├── reports.actions.ts      # Acciones para descargar reportes
│   ├── reports.constants.ts    # Configuración de reportes
│   ├── reports.hook.ts         # Hooks de React Query
│   ├── reports.interface.ts    # Interfaces TypeScript
│   └── reports.schema.ts       # Esquemas de validación Zod
├── index.ts                    # Exportaciones públicas
└── README.md                   # Esta documentación
```

## Características

- ✅ Soporte para formatos Excel y PDF
- ✅ Filtros dinámicos configurables por reporte
- ✅ Tipos de campos: text, number, date, daterange, select
- ✅ Selects con carga dinámica desde endpoints
- ✅ Validación con Zod
- ✅ Descarga automática de archivos
- ✅ Manejo de errores con toasts
- ✅ Loading states
- ✅ Totalmente tipado con TypeScript

## Uso Rápido

### 1. Agregar un nuevo reporte

Edita el archivo [reports.constants.ts](lib/reports.constants.ts):

```typescript
export const COMMERCIAL_REPORTS: ReportConfig[] = [
  {
    id: "mi-reporte",
    title: "Mi Nuevo Reporte",
    description: "Descripción del reporte",
    icon: "FileBarChart", // Cualquier ícono de lucide-react
    endpoint: "/ap/commercial/mi-endpoint/export",
    fields: [
      {
        name: "date_from",
        label: "Fecha de Inicio",
        type: "date",
        required: true,
      },
      {
        name: "sede_id",
        label: "Sede",
        type: "select",
        required: false,
        placeholder: "Todas las sedes",
        endpoint: "/admin/sedes",
        optionsMapper: (data) =>
          data?.data?.map((item) => ({
            label: item.name,
            value: item.id.toString(),
          })) || [],
      },
    ],
    defaultParams: {
      include_details: true,
    },
  },
];
```

### 2. Tipos de campos disponibles

#### Text
```typescript
{
  name: "customer_name",
  label: "Nombre del Cliente",
  type: "text",
  required: false,
  placeholder: "Ingrese el nombre",
}
```

#### Number
```typescript
{
  name: "min_amount",
  label: "Monto Mínimo",
  type: "number",
  required: false,
  placeholder: "0",
}
```

#### Date
```typescript
{
  name: "fecha_inicio",
  label: "Fecha de Inicio",
  type: "date",
  required: true,
}
```

#### Date Range
```typescript
{
  name: "date_range", // Este name no se usa directamente
  label: "Rango de Fechas",
  type: "daterange",
  required: false,
  nameFrom: "date_from",  // Nombre del parámetro inicio
  nameTo: "date_to",      // Nombre del parámetro fin
}
```

#### Select con opciones estáticas
```typescript
{
  name: "status",
  label: "Estado",
  type: "select",
  required: false,
  placeholder: "Seleccionar estado",
  options: [
    { label: "Activo", value: "active" },
    { label: "Inactivo", value: "inactive" },
  ],
  defaultValue: "active",
}
```

#### Select con opciones dinámicas
```typescript
{
  name: "sede_id",
  label: "Sede",
  type: "select",
  required: false,
  endpoint: "/admin/sedes", // Endpoint que retorna las opciones
  optionsMapper: (data) =>
    data?.data?.map((sede) => ({
      label: sede.name,
      value: sede.id.toString(),
    })) || [],
}
```

### 3. Ejemplo completo: Reporte de Ventas de Vehículos

```typescript
{
  id: "vehicle-sales",
  title: "Reporte de Ventas de Vehículos",
  description: "Exporta el reporte de ventas de vehículos con filtros personalizados",
  icon: "FileBarChart",
  endpoint: "/ap/commercial/vehicles/export/sales",
  fields: [
    {
      name: "is_paid",
      label: "Estado de Pago",
      type: "select",
      required: false,
      options: [
        { label: "Todos", value: "" },
        { label: "Pagado", value: "1" },
        { label: "Pendiente", value: "0" },
      ],
      defaultValue: "1",
    },
    {
      name: "date_range",
      label: "Rango de Fechas",
      type: "daterange",
      required: false,
      nameFrom: "date_from",
      nameTo: "date_to",
    },
    {
      name: "sede_id",
      label: "Sede",
      type: "select",
      required: false,
      endpoint: "/admin/sedes",
      optionsMapper: (data) =>
        data?.data?.map((sede) => ({
          label: sede.name,
          value: sede.id.toString(),
        })) || [],
    },
  ],
  defaultParams: {},
}
```

## API del Backend

El sistema espera que los endpoints del backend:

1. Acepten parámetros via query string:
   - `format`: "excel" o "pdf" (obligatorio)
   - Otros parámetros según la configuración del reporte

2. Retornen un blob (archivo binario) con headers apropiados:
   ```php
   return response()->download($filePath, $fileName, [
       'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
       'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
   ]);
   ```

### Ejemplo de endpoint en Laravel:

```php
Route::get('/vehicles/export/sales', function (Request $request) {
    $format = $request->input('format', 'excel');
    $isPaid = $request->input('is_paid');
    $dateFrom = $request->input('date_from');
    $dateTo = $request->input('date_to');
    $sedeId = $request->input('sede_id');

    // Tu lógica de generación del reporte...

    if ($format === 'pdf') {
        return response()->download($pdfPath, 'reporte.pdf', [
            'Content-Type' => 'application/pdf',
        ]);
    }

    return response()->download($excelPath, 'reporte.xlsx', [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]);
});
```

## Parámetros que se envían al backend

Cuando el usuario hace clic en "Descargar Reporte", el sistema envía:

1. El parámetro `format` (siempre)
2. Todos los campos configurados en `fields` que tengan valor
3. Los parámetros de `defaultParams` (si están configurados)

Ejemplo de request:
```
GET /ap/commercial/vehicles/export/sales?format=excel&is_paid=1&date_from=2024-01-01&date_to=2024-12-31&sede_id=5
```

## Notas Importantes

- Los valores vacíos, `null` o `undefined` NO se envían al backend
- Las fechas se convierten automáticamente a formato ISO (YYYY-MM-DD)
- El campo `format` siempre está presente en todos los reportes
- Los nombres de archivo se extraen del header `Content-Disposition` si está disponible
- Si no hay nombre en el header, se genera automáticamente: `reporte_[timestamp].[ext]`

## Acceso

La página de reportes está disponible en:
```
http://localhost:5173/ap/comercial/reportes
```

## Troubleshooting

### El select no muestra opciones
- Verifica que el `endpoint` sea correcto
- Verifica que el `optionsMapper` esté retornando el formato correcto: `{ label: string, value: string | number }`
- Revisa la consola del navegador para ver errores de API

### El reporte no se descarga
- Verifica que el backend esté retornando un blob con los headers correctos
- Revisa la Network tab en DevTools para ver la respuesta
- Verifica que el `endpoint` en la configuración sea correcto

### Los parámetros no llegan al backend
- Verifica que los nombres de los campos (`name`, `nameFrom`, `nameTo`) coincidan con lo que espera el backend
- Los valores vacíos no se envían, considera usar `defaultValue` si necesitas enviar siempre un valor
