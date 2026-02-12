# Implementación de Segmentos de Tipos de Trabajo (Work Type Segments)

## Resumen

Se ha implementado un sistema completo para gestionar **Tipos de Trabajo (Work Types)** con **Segmentos de Tiempo** configurables. Este permite a los usuarios definir turnos (Mañana/Noche) y dividirlos en segmentos personalizados con diferentes multiplicadores de pago.

## Características Principales

### 1. Tipos de Turno
- **Turno Mañana**: 7:00 AM - 7:00 PM (12 horas)
- **Turno Noche**: 7:00 PM - 7:00 AM (12 horas)

### 2. Segmentos de Tiempo
Cada turno se puede dividir en segmentos con:
- **Tipo**: WORK (Trabajo) o BREAK (Descanso)
- **Duración**: Horas asignadas al segmento
- **Multiplicador**: Factor de pago (ej: 1.25 para horas extras)
- **Descripción**: Texto explicativo del segmento

### 3. Validaciones Implementadas
- ✅ Los segmentos deben cubrir exactamente 12 horas
- ✅ No puede haber traslapes entre segmentos
- ✅ No puede haber espacios vacíos sin asignar
- ✅ Los segmentos deben ser continuos

### 4. Interfaz Visual
- **Timeline interactivo**: Visualización gráfica de los segmentos
- **Código de colores**:
  - 🔵 Azul: Trabajo normal
  - 🟢 Verde: Horas extra (multiplicador > 1)
  - 🟠 Naranja: Descanso
- **Edición intuitiva**: Click en segmentos para editar
- **Lista de segmentos**: Vista detallada con opciones de editar/eliminar

## Archivos Modificados y Creados

### Interfaces y Tipos (`work-type.interface.ts`)
```typescript
// Nuevos tipos
export type ShiftType = "MORNING" | "NIGHT";
export type SegmentType = "WORK" | "BREAK";

// Interfaces de segmentos
export interface WorkTypeSegmentResource {
  id: number;
  work_type_id: number;
  segment_type: SegmentType;
  segment_order: number;
  duration_hours: number;
  multiplier: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface WorkTypeSegment {
  id?: number;
  segment_type: SegmentType;
  segment_order: number;
  start_hour: number;
  end_hour: number;
  duration_hours: number;
  multiplier: number;
  description: string;
  tempId?: string;
}
```

### Schemas de Validación (`work-type.schema.ts`)
```typescript
// Schema para segmentos
export const workTypeSegmentSchema = z.object({
  id: z.number().optional(),
  segment_type: z.enum(["WORK", "BREAK"]),
  segment_order: z.number().min(1),
  start_hour: z.number().min(0).max(24),
  end_hour: z.number().min(0).max(24),
  duration_hours: z.number().min(0).max(24),
  multiplier: z.coerce.number().min(0).max(10),
  description: z.string().max(255).default(""),
  tempId: z.string().optional(),
});

// WorkType actualizado con segmentos
export const workTypeSchemaCreate = z.object({
  // ... campos existentes ...
  shift_type: z.enum(["MORNING", "NIGHT"]).optional(),
  segments: z.array(workTypeSegmentSchema).default([]),
});
```

### Acciones API (`work-type.actions.ts`)
```typescript
// Nuevas funciones para gestionar segmentos
export async function getWorkTypeSegments(workTypeId: number): Promise<WorkTypeResource>
export async function storeWorkTypeSegment(workTypeId: number, segmentData: any): Promise<any>
export async function updateWorkTypeSegment(workTypeId: number, segmentId: number, segmentData: any): Promise<any>
export async function deleteWorkTypeSegment(workTypeId: number, segmentId: number): Promise<GeneralResponse>
```

### Componentes Nuevos

#### 1. `SegmentDialog.tsx`
Modal para editar propiedades de un segmento:
- Tipo (Trabajo/Descanso)
- Hora inicio/fin
- Multiplicador
- Descripción

#### 2. `TimelineSegmentEditor.tsx`
Componente principal con:
- Timeline visual con segmentos
- Lista de segmentos
- Validación en tiempo real
- Indicador de estado (válido/incompleto)
- Tooltips informativos
- Leyenda de colores

### Formulario Actualizado (`WorkTypeForm.tsx`)
- ➕ Selector de tipo de turno
- ➕ Integración del TimelineSegmentEditor
- ➕ Manejo de estado de segmentos
- ➕ Reset de segmentos al cambiar tipo de turno

### Páginas Actualizadas

#### `agregar/page.tsx`
- Transforma segmentos al formato requerido por la API
- Valores por defecto actualizados (base_hours: 12, shift_type: "MORNING")

#### `actualizar/[id]/page.tsx`
- Carga segmentos existentes desde la API
- Mapea segmentos de la API al formato del formulario
- Calcula start_hour y end_hour basado en segment_order

## Flujo de Uso

### Crear un Nuevo Tipo de Trabajo con Segmentos

1. **Seleccionar Tipo de Turno**
   - Elegir entre "Turno Mañana" o "Turno Noche"

2. **Agregar Información Básica**
   - Código (ej: "TM", "TN")
   - Nombre (ej: "Turno Mañana")
   - Descripción opcional

3. **Configurar Segmentos**
   - Click en "Agregar Segmento"
   - Definir hora inicio/fin
   - Seleccionar tipo (Trabajo/Descanso)
   - Establecer multiplicador
   - Agregar descripción

4. **Validación Automática**
   - El sistema verifica que los segmentos cubran las 12 horas
   - Muestra errores si hay traslapes o huecos
   - Indicador visual de estado (✓ Válido / ⚠ Incompleto)

5. **Guardar**
   - Solo se puede guardar si los segmentos son válidos
   - Los segmentos se envían al backend junto con el WorkType

## Ejemplo de Configuración

### Turno Mañana (7 AM - 7 PM)
```
07:00 - 13:00 | WORK  | x1.0  | "Jornada matutina (6h)"
13:00 - 14:00 | BREAK | x0.0  | "Almuerzo"
14:00 - 17:00 | WORK  | x1.0  | "Jornada tarde (3h)"
17:00 - 19:00 | WORK  | x1.25 | "Horas extras (2h)"
Total: 12 horas ✓
```

### Turno Noche (7 PM - 7 AM)
```
19:00 - 01:00 | WORK  | x1.5  | "Primera mitad nocturna (6h)"
01:00 - 02:00 | BREAK | x0.0  | "Descanso"
02:00 - 07:00 | WORK  | x1.5  | "Segunda mitad nocturna (5h)"
Total: 12 horas ✓
```

## Integración con Backend

### Endpoints Utilizados

#### Work Types
- `GET /gp/gh/payroll/work-types` - Listar todos
- `GET /gp/gh/payroll/work-types/{id}` - Obtener uno (incluye segmentos)
- `POST /gp/gh/payroll/work-types` - Crear nuevo
- `PUT /gp/gh/payroll/work-types/{id}` - Actualizar
- `DELETE /gp/gh/payroll/work-types/{id}` - Eliminar

#### Work Type Segments
- `GET /gp/gh/payroll/work-types/{workTypeId}/segments` - Listar segmentos
- `POST /gp/gh/payroll/work-types/{workTypeId}/segments` - Crear segmento
- `PUT /gp/gh/payroll/work-types/{workTypeId}/segments/{id}` - Actualizar segmento
- `DELETE /gp/gh/payroll/work-types/{workTypeId}/segments/{id}` - Eliminar segmento

### Formato de Datos

#### Crear/Actualizar WorkType
```json
{
  "code": "TM",
  "name": "Turno Mañana",
  "description": "Turno diurno de 12 horas",
  "shift_type": "MORNING",
  "base_hours": 12,
  "multiplier": 1,
  "active": true,
  "order": 1,
  "segments": [
    {
      "segment_type": "WORK",
      "segment_order": 1,
      "duration_hours": 6,
      "multiplier": 1.0,
      "description": "Jornada matutina"
    },
    {
      "segment_type": "BREAK",
      "segment_order": 2,
      "duration_hours": 1,
      "multiplier": 0.0,
      "description": "Almuerzo"
    }
  ]
}
```

## Notas Técnicas

### Estado del Formulario
- Los segmentos se almacenan en el estado del formulario usando `react-hook-form`
- `tempId` se usa para segmentos nuevos no guardados aún
- Al guardar, los segmentos se ordenan y renumeran automáticamente

### Cálculo de Posiciones
El timeline calcula las posiciones de los segmentos basándose en:
- Hora de inicio del turno (7 AM o 7 PM)
- Duración de cada segmento
- Posición relativa dentro de las 12 horas totales

### Validación en Tiempo Real
- Se ejecuta cada vez que cambian los segmentos
- Verifica continuidad, traslapes y duración total
- Muestra errores específicos para cada problema detectado

## Mejoras Futuras Posibles

1. **Arrastrar y soltar**: Permitir reordenar segmentos arrastrándolos
2. **Redimensionar visual**: Ajustar duración arrastrando bordes
3. **Plantillas**: Guardar configuraciones comunes de segmentos
4. **Duplicar segmentos**: Copiar un segmento existente
5. **Importar/Exportar**: Compartir configuraciones entre sistemas
6. **Vista calendario**: Visualizar segmentos en un calendario mensual
7. **Reportes**: Análisis de horas y multiplicadores aplicados

## Soporte

Para preguntas o problemas:
- Revisar validaciones en `TimelineSegmentEditor.tsx`
- Verificar formato de datos en `work-type.interface.ts`
- Consultar schemas en `work-type.schema.ts`

---

**Fecha de implementación**: 2026-02-05
**Versión**: 1.0.0
