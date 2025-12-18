"use client";

import { useForm } from "react-hook-form";
import {
  ExpenseTypeSchema,
  expenseTypeSchema,
} from "../lib/expenseType.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { Switch } from "@/components/ui/switch";
import { useAllExpenseTypes } from "../lib/expenseType.hook";
import { Option } from "@/core/core.interface";
import { Textarea } from "@/components/ui/textarea";

interface ExpenseTypeFormProps {
  defaultValues?: Partial<ExpenseTypeSchema>;
  onSubmit: (data: ExpenseTypeSchema) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const ExpenseTypeForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  onCancel,
}: ExpenseTypeFormProps) => {
  const form = useForm<ExpenseTypeSchema>({
    resolver: zodResolver(expenseTypeSchema) as any,
    defaultValues: {
      code: "",
      name: "",
      full_name: "",
      description: "",
      requires_receipt: false,
      active: true,
      order: 0,
      parent_id: null,
      ...defaultValues,
    },
    mode: "onChange",
  });

  // Obtener todos los tipos de gasto para el selector de padre
  const { data: expenseTypes } = useAllExpenseTypes();

  const parentOptions: Option[] = [
    { value: "", label: "Sin categoría padre" },
    ...(expenseTypes?.map((type) => ({
      value: type.id.toString(),
      label: type.name,
    })) || []),
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 sm:space-y-6 w-full"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput
            name="code"
            label="Código"
            placeholder="Ej: local_transport"
            control={form.control}
            required
          />

          <FormInput
            name="name"
            label="Nombre"
            placeholder="Ej: Transporte Local"
            control={form.control}
            required
          />
        </div>

        <FormInput
          name="full_name"
          label="Nombre Completo"
          placeholder="Ej: Transporte Local"
          control={form.control}
          required
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs md:text-sm">
                Descripción (Opcional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del tipo de gasto..."
                  className="resize-none min-h-20 text-xs md:text-sm"
                  rows={3}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            name="parent_id"
            label="Categoría Padre"
            placeholder="Selecciona una categoría"
            options={parentOptions}
            control={form.control}
          />

          <FormInput
            name="order"
            label="Orden"
            type="number"
            placeholder="0"
            control={form.control}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="requires_receipt"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs md:text-sm">
                    Requiere Comprobante
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    ¿Este tipo de gasto requiere comprobante?
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-xs md:text-sm">Estado</FormLabel>
                  <p className="text-xs text-muted-foreground">
                    ¿Este tipo de gasto está activo?
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="w-full sm:w-auto"
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Tipo de Gasto"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
