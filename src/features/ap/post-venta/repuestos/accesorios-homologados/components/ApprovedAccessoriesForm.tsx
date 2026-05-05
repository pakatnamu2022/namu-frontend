import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
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
import { FormInput } from "@/shared/components/FormInput.tsx";

interface ApprovedAccesoriesFormProps {
  defaultValues: Partial<ApprovedAccesoriesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const typeOperationOptions = [
  {
    label: "Comercial",
    value: "794",
  },
  {
    label: "Posventa",
    value: "804",
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
        : approvedAccesoriesSchemaUpdate,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="code"
            label="Código"
            control={form.control}
            placeholder="Ej: LS"
            uppercase
          />

          <FormInput
            name="description"
            label="Descripción"
            control={form.control}
            placeholder="Ej: Láminas de Seguridad"
            uppercase
          />

          <FormInput
            name="price"
            label="Precio"
            control={form.control}
            placeholder="Ej: 390"
            type="number"
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
            name="type_operation_id"
            label="Tipo de Operación"
            placeholder="Selecciona un tipo de operación"
            options={typeOperationOptions}
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
