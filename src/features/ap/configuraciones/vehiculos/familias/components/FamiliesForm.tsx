import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useAllBrands } from "../../marcas/lib/brands.hook";
import {
  FamiliesSchema,
  familiesSchemaCreate,
  familiesSchemaUpdate,
} from "../lib/families.schema";

interface FamiliesFormProps {
  defaultValues: Partial<FamiliesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const FamiliesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: FamiliesFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? familiesSchemaCreate : familiesSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: brands = [], isLoading: isLoadingbrands } = useAllBrands();

  if (isLoadingbrands) {
    return <div className="p-4 text-muted">Cargando Familias</div>;
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
                  <Input placeholder="Ej: X7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="brand_id"
            label="Marca"
            placeholder="Selecciona un marca"
            options={brands.map((brand) => ({
              label: brand.description,
              value: brand.id.toString(),
            }))}
            control={form.control}
            disabled={mode === "update"}
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
            {isSubmitting ? "Guardando" : "Guardar Familia"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
