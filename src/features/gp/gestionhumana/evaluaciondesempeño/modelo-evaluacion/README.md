# Modelo de Evaluación - CRUD Completo

Este módulo implementa el CRUD completo para la gestión de Modelos de Evaluación de Desempeño.

## 📁 Estructura

```
modelo-evaluacion/
├── lib/
│   ├── evaluationModel.actions.ts     # Acciones del API
│   ├── evaluationModel.constants.ts   # Constantes del modelo
│   ├── evaluationModel.hook.ts        # Hooks de React Query
│   ├── evaluationModel.interface.ts   # Interfaces TypeScript
│   └── evaluationModel.schema.ts      # Esquemas de validación Zod
├── components/
│   ├── EvaluationModelActions.tsx     # Botón de agregar
│   ├── EvaluationModelColumns.tsx     # Definición de columnas
│   ├── EvaluationModelForm.tsx        # Formulario principal
│   ├── EvaluationModelOptions.tsx     # Acciones de fila (editar/eliminar)
│   └── EvaluationModelTable.tsx       # Tabla principal
└── index.ts                            # Exportaciones
```

## 🎯 Características

### Request Format
```json
{
  "leadership_weight": 60,
  "self_weight": 40,
  "par_weight": 0,
  "report_weight": 0,
  "categories": [10, 12]
}
```

### Response Format
```json
{
  "data": [{
    "id": 1,
    "categories": "10,12",
    "leadership_weight": "60.00",
    "self_weight": "40.00",
    "par_weight": "0.00",
    "report_weight": "0.00",
    "category_details": [
      {
        "id": 10,
        "name": "Caja General",
        "description": "Description...",
        "excluded_from_evaluation": false,
        "hasObjectives": true
      }
    ]
  }]
}
```

## ✨ Validaciones Implementadas

1. **Suma de pesos = 100%**: Validación en tiempo real con mensaje de error
2. **Pesos individuales**: Entre 0 y 100
3. **Categorías**: Al menos una categoría requerida
4. **Indicador visual**: Muestra el total y faltante/excedente en tiempo real

## 🔧 Componente Reutilizable

Se creó el componente genérico **MultiSelectTags** ubicado en:
`src/shared/components/MultiSelectTags.tsx`

### Uso del MultiSelectTags

Este componente funciona igual que `FormSelect`, recibe `control` y `name` directamente.

**IMPORTANTE:** El componente guarda directamente los IDs (números) en el formulario, no los objetos completos.

```tsx
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import { useForm } from "react-hook-form";

// Dentro de tu componente con formulario
const form = useForm({
  defaultValues: {
    categories: [] // Array de IDs: [10, 12, 15]
  }
});

// Uso simple - El componente maneja el FormField internamente
<MultiSelectTags
  control={form.control}
  name="categories"
  label="Categorías"
  placeholder="Selecciona opciones"
  searchPlaceholder="Buscar..."
  emptyMessage="No se encontraron resultados"
  options={allItems}
  getDisplayValue={(item) => item.name}
  getSecondaryText={(item) => item.description}
  className="max-w-full"
  required
/>

// El formulario guardará: { categories: [10, 12, 15] }
// NO guardará objetos completos
```

**Props disponibles:**
- `control`: Control de react-hook-form
- `name`: Nombre del campo en el formulario
- `label`: Etiqueta del campo (opcional)
- `description`: Descripción adicional (opcional)
- `placeholder`: Texto placeholder
- `searchPlaceholder`: Placeholder del buscador
- `emptyMessage`: Mensaje cuando no hay opciones
- `options`: Array de opciones
- `getDisplayValue`: Función para obtener el texto a mostrar
- `getSecondaryText`: Función para texto secundario (opcional)
- `disabled`: Deshabilitar el campo
- `required`: Mostrar indicador de campo requerido

## 📄 Rutas

- **Listado**: `/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion`
- **Crear**: `/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/agregar`
- **Editar**: `/gp/gestion-humana/evaluaciones-de-desempeno/modelo-evaluacion/actualizar/[id]`

## 🚀 Uso

### En el formulario
```tsx
import { EvaluationModelForm } from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion";

<EvaluationModelForm
  defaultValues={model}
  onSubmit={handleSubmit}
  isPending={isLoading}
/>
```

### Hooks disponibles
```tsx
import {
  useEvaluationModels,
  useEvaluationModelById,
  useStoreEvaluationModel,
  useUpdateEvaluationModel,
  useDeleteEvaluationModel
} from "@/features/gp/gestionhumana/evaluaciondesempeño/modelo-evaluacion";

// Listar con paginación
const { data, isLoading } = useEvaluationModels({ params: { page: 1 } });

// Obtener por ID
const { data: model } = useEvaluationModelById(id);

// Crear
const { mutate: create } = useStoreEvaluationModel();

// Actualizar
const { mutate: update } = useUpdateEvaluationModel(id);

// Eliminar
const { mutate: remove } = useDeleteEvaluationModel();
```

## 📋 Manejo de Errores

El sistema captura y muestra el mensaje de error del backend:
```
"Error al crear el modelo de evaluación: La suma de los pesos debe ser igual a 100"
```
