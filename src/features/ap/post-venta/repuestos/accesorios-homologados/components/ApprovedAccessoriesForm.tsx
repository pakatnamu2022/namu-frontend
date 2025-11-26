import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import {
  ApprovedAccesoriesSchema,
  approvedAccesoriesSchemaCreate,
  approvedAccesoriesSchemaUpdate,
} from "../lib/approvedAccessories.schema.ts";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { useAllBodyType } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.hook.ts";
import { APPROVED_ACCESSORIES } from "../lib/approvedAccessories.constants.ts";

interface ApprovedAccesoriesFormProps {
  defaultValues: Partial<ApprovedAccesoriesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const typeOptions = [
  {
    label: "Servicio",
    value: "SERVICIO",
  },
  {
    label: "Repuesto",
    value: "REPUESTO",
  },
];

export const ApprovedAccesoriesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: ApprovedAccesoriesFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? approvedAccesoriesSchemaCreate
        : approvedAccesoriesSchemaUpdate
    ) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = APPROVED_ACCESSORIES;

  const { data: typesBody = [], isLoading: isLoadingTypesBody } =
    useAllBodyType();

  if (isLoadingTypesBody) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: LS" {...field} />
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
                  <Input placeholder="Ej: Láminas de Seguridad" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Ej: 390" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="body_type_id"
            label="Carrocería"
            placeholder="Selecciona una carrocería"
            options={
              typesBody.map((item) => ({
                label: item.code + " - " + item.description,
                value: item.id.toString(),
              })) /* Replace with actual options */
            }
            control={form.control}
          />
          <FormSelect
            name="type"
            label="Tipo"
            placeholder="Selecciona un tipo"
            options={typeOptions}
            control={form.control}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE!}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Accessorio"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
