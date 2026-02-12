import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader } from "lucide-react";
import {
  CurrencyTypesSchema,
  currencyTypesSchemaCreate,
  currencyTypesSchemaUpdate,
} from "../lib/CurrencyTypes.schema";
import { FormInput } from "@/shared/components/FormInput";

interface CurrencyTypesFormProps {
  defaultValues: Partial<CurrencyTypesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const CurrencyTypesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: CurrencyTypesFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? currencyTypesSchemaCreate : currencyTypesSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormInput
              label="Nombre de la Moneda"
              name="name"
              control={form.control}
              placeholder="Ej: Sol Peruano"
            />
          </div>

          <FormInput
            label="Código"
            name="code"
            control={form.control}
            placeholder="Ej: PEN"
          />

          <FormInput
            label="Símbolo"
            name="symbol"
            control={form.control}
            placeholder="Ej: S/"
          />
        </div>

        <div className="space-y-3 pt-2 border-t">
          <FormLabel className="text-base font-semibold">
            Áreas Habilitadas
          </FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <FormField
              control={form.control}
              name="enable_commercial"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Área Comercial
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="enable_after_sales"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent/50 transition-colors">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Área Post-Venta
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex gap-3 w-full justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Guardando..." : "Guardar Tipo Moneda"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
