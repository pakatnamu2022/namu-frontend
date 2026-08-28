import {
  ProductShelfSchema,
  productShelfSchemaCreate,
  productShelfSchemaUpdate,
} from "@/features/ap/post-venta/gestion-almacen/estantes-almacen/lib/productShelf.schema.ts";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { FormTextArea } from "@/shared/components/FormTextArea.tsx";
import { FormSwitch } from "@/shared/components/FormSwitch.tsx";
import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";

interface ProductShelfFormProps {
  defaultValues: Partial<ProductShelfSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  warehouses: WarehouseResource[];
}

export const ProductShelfForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  warehouses,
}: ProductShelfFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? productShelfSchemaCreate : productShelfSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormSelect
          name="warehouse_id"
          label="Almacén"
          placeholder="Selecciona un almacén"
          required
          options={warehouses.map((warehouse) => ({
            label: warehouse.dyn_code,
            value: warehouse.id.toString(),
            description: warehouse.description,
          }))}
          control={form.control}
          disabled={mode === "update"}
        />

        <FormInput
          control={form.control}
          name="label"
          label="Nombre del Estante"
          placeholder="Ej: Estante A - Pasillo 1"
          required
        />

        <FormTextArea
          control={form.control}
          name="notes"
          label="Notas"
          placeholder="Referencia de ubicación, observaciones, etc."
          rows={3}
          className="resize-none"
        />

        {mode === "update" && (
          <FormSwitch
            control={form.control}
            name="status"
            text="Estante activo"
            textDescription="Los estantes inactivos no aparecen al organizar productos"
          />
        )}

        <div className="flex gap-4 w-full justify-end pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              (mode === "create" && !form.formState.isValid) ||
              (mode === "update" && !form.formState.isDirty)
            }
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Estante"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
