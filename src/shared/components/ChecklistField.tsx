"use client";

import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface ChecklistItem {
  id: number;
  description: string;
  category?: string;
  has_quantity?: boolean;
}

interface ChecklistFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label?: string;
  items: ChecklistItem[];
}

/**
 * Componente de checklist interactivo
 * Permite seleccionar múltiples ítems de una lista con cantidades opcionales
 *
 * Los items seleccionados se almacenan en un objeto donde:
 * - La clave es el ID del item
 * - El valor es la cantidad (0 si no tiene cantidad o no se especifica)
 *
 * Ejemplo de field.value: { 33: 5, 32: 0, 31: 10 }
 *
 * @example
 * ```tsx
 * <ChecklistField
 *   form={form}
 *   name="items_receiving"
 *   label="Equipamiento del Vehículo"
 *   items={deliveryChecklist}
 * />
 * ```
 */
export const ChecklistField = ({
  form,
  name,
  label = "Checklist",
  items,
}: ChecklistFieldProps) => {
  // Agrupar items por categoría
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || "OTROS";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const handleToggleItem = (itemId: number) => {
    const currentItems = form.getValues(name) || {};
    const itemKey = String(itemId);

    if (currentItems[itemKey] !== undefined) {
      // Si existe, lo eliminamos
      const { [itemKey]: _, ...rest } = currentItems;
      form.setValue(name, rest, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // Si no existe, lo agregamos con cantidad 0
      form.setValue(
        name,
        { ...currentItems, [itemKey]: "0" },
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
    }
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      // Seleccionar todos con cantidad 0
      const allItems = items.reduce((acc, item) => {
        acc[String(item.id)] = "0";
        return acc;
      }, {} as Record<string, string>);
      form.setValue(name, allItems, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // Deseleccionar todos
      form.setValue(
        name,
        {},
        {
          shouldValidate: true,
          shouldDirty: true,
        }
      );
    }
  };

  const handleQuantityChange = (itemId: number, value: string) => {
    const currentItems = form.getValues(name) || {};
    const itemKey = String(itemId);
    const stringValue = value === "" ? "0" : value;

    form.setValue(
      name,
      { ...currentItems, [itemKey]: stringValue },
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="space-y-4">
            {/* Header con label y contador */}
            <div className="flex items-center justify-between">
              <FormLabel className="text-base font-semibold">{label}</FormLabel>
              <div className="flex items-center gap-2">
                <Badge color="secondary">
                  {Object.keys(field.value || {}).length} / {items.length}{" "}
                  seleccionados
                </Badge>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={
                      Object.keys(field.value || {}).length === items.length
                    }
                    onCheckedChange={handleToggleAll}
                  />
                  <span className="text-gray-600">Seleccionar todos</span>
                </label>
              </div>
            </div>

            {/* Lista de items agrupados por categoría */}
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} className="space-y-3">
                  {/* Título de categoría */}
                  <h4 className="text-sm font-medium text-gray-700 border-b pb-1">
                    {category}
                  </h4>

                  {/* Items de la categoría */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {categoryItems.map((item) => {
                      const itemsReceiving = field.value || {};
                      const itemKey = String(item.id);
                      const isChecked = itemsReceiving[itemKey] !== undefined;
                      const quantity = itemsReceiving[itemKey] || "";

                      return (
                        <FormControl key={item.id}>
                          <label
                            className={`
                              flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none
                              ${
                                isChecked
                                  ? "border-primary bg-muted"
                                  : "hover:border-muted hover:bg-muted"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                className="rounded"
                                checked={isChecked}
                                onCheckedChange={() =>
                                  handleToggleItem(item.id)
                                }
                              />
                              <span
                                className={`text-sm ${
                                  isChecked
                                    ? "font-medium text-primary"
                                    : "text-foreground"
                                }`}
                              >
                                {item.description}
                              </span>
                            </div>
                            {item.has_quantity && isChecked && (
                              <Input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) =>
                                  handleQuantityChange(item.id, e.target.value)
                                }
                                className="w-20 h-8"
                                placeholder="Cant."
                              />
                            )}
                          </label>
                        </FormControl>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
