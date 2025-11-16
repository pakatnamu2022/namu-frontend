import {
  DeliveryChecklistSchema,
  deliveryChecklistSchemaCreate,
  deliveryChecklistSchemaUpdate,
} from "../lib/deliveryChecklist.schema";
import { useForm } from "react-hook-form";
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
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllCategoryChecklist } from "../../categorias-checklist/lib/categoryChecklist.hook";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Checkbox } from "@/components/ui/checkbox";

interface DeliveryChecklistFormProps {
  defaultValues: Partial<DeliveryChecklistSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const DeliveryChecklistForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: DeliveryChecklistFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? deliveryChecklistSchemaCreate
        : deliveryChecklistSchemaUpdate
    ),
    defaultValues: {
      has_quantity: false,
      ...defaultValues,
    },
    mode: "onChange",
  });

  const {
    data: categoryChecklist = [],
    isLoading: isLoadingcategoryChecklist,
  } = useAllCategoryChecklist();

  if (isLoadingcategoryChecklist) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <FormSelect
            name="category_id"
            label="Categoría"
            placeholder="Selecciona un categoría"
            options={
              categoryChecklist.map((brandGroup) => ({
                label: brandGroup.description,
                value: brandGroup.id.toString(),
              })) /* Replace with actual options */
            }
            control={form.control}
          />

          <FormField
            control={form.control}
            name="has_quantity"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border h-10 px-3 self-end">
                <FormControl>
                  <Checkbox
                    checked={!!field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                </FormControl>
                <FormLabel>¿Tiene Cantidad?</FormLabel>
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
            {isSubmitting ? "Guardando" : "Guardar Item de Entrega"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
