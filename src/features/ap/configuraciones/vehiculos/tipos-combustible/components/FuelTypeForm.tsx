import { useForm } from "react-hook-form";
import {
  FuelTypeSchema,
  fuelTypeSchemaCreate,
  fuelTypeSchemaUpdate,
} from "../lib/fuelType.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface FuelTypeFormProps {
  defaultValues: Partial<FuelTypeSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const FuelTypeForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: FuelTypeFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? fuelTypeSchemaCreate : fuelTypeSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      electric_motor: !!defaultValues.electric_motor,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: DI" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Diese" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="electric_motor"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    className="rounded"
                    checked={!!field.value}
                    onCheckedChange={field.onChange}
                    aria-label="Motor Eléctrico"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  Motor Eléctrico
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
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
            {isSubmitting ? "Guardando" : "Guardar Tipo de Combustible"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
