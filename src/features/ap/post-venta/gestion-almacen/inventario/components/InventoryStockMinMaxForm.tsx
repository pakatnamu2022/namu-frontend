import { zodResolver } from "@hookform/resolvers/zod";
import {
  InventoryStockMinMaxSchema,
  inventoryStockMinMaxSchemaUpdate,
} from "../lib/inventoryStockMinMaxSchema";
import { Form, useForm } from "react-hook-form";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/shared/components/FormInput";

interface InventoryStockMinMaxFormProps {
  defaultValues: Partial<InventoryStockMinMaxSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const InventoryStockMinMaxForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: InventoryStockMinMaxFormProps) => {
  const form = useForm({
    resolver: zodResolver(inventoryStockMinMaxSchemaUpdate),
    defaultValues: {
      ...defaultValues,
      warehouse_id: defaultValues.warehouse_id || undefined,
      product_id: defaultValues.product_id || undefined,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="minimum_stock"
            label="Stock Mínimo"
            placeholder="Ej: 10.00"
            type="number"
          />
          <FormInput
            control={form.control}
            name="maximum_stock"
            label="Stock Máximo"
            placeholder="Ej: 100.00"
            type="number"
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
