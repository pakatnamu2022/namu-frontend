import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useInventory } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.hook";
import { InventoryResource } from "@/features/ap/post-venta/gestion-compras/inventario/lib/inventory.interface";
import { Control } from "react-hook-form";

interface ProductSelectAsyncProps {
  control: Control<any>;
  warehouseId: string;
  disabled?: boolean;
}

export function ProductSelectAsync({
  control,
  warehouseId,
  disabled,
}: ProductSelectAsyncProps) {
  // Hook personalizado para este componente
  const useInventoryProducts = (params: {
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    return useInventory(
      {
        warehouse_id: warehouseId,
        search: params.search,
        page: params.page,
        per_page: params.per_page,
      },
      { enabled: !!warehouseId }
    );
  };

  return (
    <FormSelectAsync
      name="product_id"
      label="Producto"
      placeholder="Seleccione producto"
      control={control}
      disabled={disabled}
      useQueryHook={useInventoryProducts}
      mapOptionFn={(inventory: InventoryResource) => ({
        label: () => (
          <div className="flex items-center justify-between gap-2 w-full">
            <span className="font-medium truncate">
              {inventory.product.name}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                  inventory.available_quantity > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                Stock: {inventory.available_quantity}
              </span>
            </div>
          </div>
        ),
        value: inventory.product_id.toString(),
        description: `Stock disponible: ${inventory.available_quantity}`,
      })}
      perPage={15}
      debounceMs={300}
    />
  );
}
