# MultiSelectTags - Componente Genérico para Selección Múltiple

Componente reutilizable que funciona como `FormSelect` pero para selección múltiple con tags.

## 🎯 Características

- ✅ **API similar a FormSelect**: Recibe `control` y `name` directamente
- ✅ **FormField interno**: No necesitas envolver en FormField
- ✅ **Guarda solo IDs**: El formulario guarda array de números, no objetos completos
- ✅ **Genérico con TypeScript**: Type-safe con cualquier tipo de datos
- ✅ **Totalmente personalizable**: Labels, placeholders, funciones de display
- ✅ **Búsqueda integrada**: Filtrado automático de opciones
- ✅ **Soporte para texto secundario**: Muestra descripciones adicionales

## 📖 Comparación: Antes vs Después

### ❌ Antes (necesitabas envolver en FormField)
```tsx
<FormField
  control={form.control}
  name="categories"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Categorías</FormLabel>
      <FormControl>
        <CategorySelector
          value={field.value}
          onChange={field.onChange}
          categories={categories}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### ✅ Después (limpio y simple como FormSelect)
```tsx
<MultiSelectTags
  control={form.control}
  name="categories"
  label="Categorías"
  placeholder="Selecciona las categorías"
  options={categories}
  getDisplayValue={(item) => item.name}
  getSecondaryText={(item) => item.description}
  required
/>
```

## 💡 Ejemplos de Uso

### Ejemplo 1: Categorías Jerárquicas
```tsx
import { MultiSelectTags } from "@/shared/components/MultiSelectTags";
import { useForm } from "react-hook-form";

const form = useForm({
  defaultValues: {
    categories: []
  }
});

<MultiSelectTags
  control={form.control}
  name="categories"
  label="Categorías"
  description="Selecciona las categorías que aplicarán"
  placeholder="Selecciona las categorías"
  searchPlaceholder="Buscar categoría..."
  emptyMessage="No se encontró categoría."
  options={hierarchicalCategories}
  getDisplayValue={(cat) => cat.name}
  getSecondaryText={(cat) => cat.description}
  required
/>
```

### Ejemplo 2: Usuarios
```tsx
<MultiSelectTags
  control={form.control}
  name="assignedUsers"
  label="Usuarios Asignados"
  placeholder="Selecciona usuarios"
  searchPlaceholder="Buscar usuario..."
  emptyMessage="No se encontraron usuarios."
  options={users}
  getDisplayValue={(user) => `${user.firstName} ${user.lastName}`}
  getSecondaryText={(user) => user.email}
/>
```

### Ejemplo 3: Productos
```tsx
<MultiSelectTags
  control={form.control}
  name="products"
  label="Productos"
  placeholder="Selecciona productos"
  options={products}
  getDisplayValue={(product) => product.name}
  getSecondaryText={(product) => `Código: ${product.code} - Stock: ${product.stock}`}
/>
```

### Ejemplo 4: Etiquetas simples
```tsx
<MultiSelectTags
  control={form.control}
  name="tags"
  label="Etiquetas"
  placeholder="Selecciona etiquetas"
  options={tags}
  getDisplayValue={(tag) => tag.name}
  // Sin texto secundario
/>
```

## 📋 Props

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `control` | `Control<any>` | ✅ | Control de react-hook-form |
| `name` | `string` | ✅ | Nombre del campo en el formulario |
| `options` | `T[]` | ✅ | Array de opciones (deben tener `id`) |
| `getDisplayValue` | `(item: T) => string` | ✅ | Función para obtener el texto a mostrar |
| `label` | `string` | ❌ | Etiqueta del campo |
| `description` | `string` | ❌ | Descripción adicional |
| `placeholder` | `string` | ❌ | Placeholder (default: "Selecciona opciones") |
| `searchPlaceholder` | `string` | ❌ | Placeholder del buscador (default: "Buscar...") |
| `emptyMessage` | `string` | ❌ | Mensaje sin resultados (default: "No se encontraron opciones.") |
| `getSecondaryText` | `(item: T) => string \| undefined` | ❌ | Función para texto secundario |
| `className` | `string` | ❌ | Clases CSS adicionales |
| `disabled` | `boolean` | ❌ | Deshabilitar el campo |
| `required` | `boolean` | ❌ | Mostrar asterisco de campo requerido |

## 🔍 Requisitos de los objetos

Los objetos en `options` deben tener al menos un campo `id`:

```typescript
interface Item {
  id: number;
  // ... otros campos
}
```

## 🎨 Personalización

### Texto personalizado en tags
```tsx
<MultiSelectTags
  getDisplayValue={(user) =>
    user.nickname || `${user.firstName} ${user.lastName}`
  }
/>
```

### Información secundaria condicional
```tsx
<MultiSelectTags
  getSecondaryText={(product) =>
    product.stock > 0
      ? `Disponible: ${product.stock}`
      : "Sin stock"
  }
/>
```

## 🚀 Ventajas

1. **Consistencia**: Misma API que FormSelect
2. **Menos código**: No necesitas wrapper FormField
3. **Type-safe**: Totalmente tipado con TypeScript
4. **Flexible**: Funciona con cualquier tipo de datos
5. **Reutilizable**: Un solo componente para todos los casos de selección múltiple
