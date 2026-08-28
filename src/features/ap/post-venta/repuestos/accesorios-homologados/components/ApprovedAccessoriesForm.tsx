import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { Loader, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { MultiSelectTags } from "@/shared/components/MultiSelectTags.tsx";
import {
  ApprovedAccesoriesSchema,
  approvedAccesoriesSchemaCreate,
  approvedAccesoriesSchemaUpdate,
  flattenPriceGroups,
} from "../lib/approvedAccessories.schema.ts";
import { previewAccessoryCode } from "../lib/approvedAccessories.code.ts";
import FormSkeleton from "@/shared/components/FormSkeleton.tsx";
import { useAllBodyType } from "@/features/ap/configuraciones/vehiculos/tipos-carroceria/lib/bodyType.hook.ts";
import { APPROVED_ACCESSORIES } from "../lib/approvedAccessories.constants.ts";
import { FormInput } from "@/shared/components/FormInput.tsx";
import {
  CM_COMERCIAL_ID,
  CM_POSTVENTA_ID,
} from "@/features/ap/ap-master/lib/apMaster.constants.ts";

interface ApprovedAccesoriesFormProps {
  defaultValues: Partial<ApprovedAccesoriesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  /** Mensaje del backend (p. ej. conflicto de carrocería) para mostrar arriba del formulario. */
  serverError?: string;
}

const typeOperationOptions = [
  {
    label: "Comercial",
    value: String(CM_COMERCIAL_ID),
  },
  {
    label: "Posventa",
    value: String(CM_POSTVENTA_ID),
  },
];

export const ApprovedAccesoriesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  serverError,
}: ApprovedAccesoriesFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? approvedAccesoriesSchemaCreate
        : approvedAccesoriesSchemaUpdate,
    ) as any,
    defaultValues: {
      priceGroups: [],
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = APPROVED_ACCESSORIES;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceGroups",
  });

  const { data: typesBody = [], isLoading: isLoadingTypesBody } =
    useAllBodyType();

  const description = form.watch("description") as string | undefined;
  const previewCode = previewAccessoryCode(description ?? "");

  // Carrocerías ya elegidas en otros grupos (no se ofrecen de nuevo).
  const groups = (form.watch("priceGroups") ?? []) as {
    body_type_ids?: number[];
  }[];

  if (isLoadingTypesBody) {
    return <FormSkeleton />;
  }

  const handleSubmit = form.handleSubmit((data: any) => {
    const { priceGroups, ...rest } = data;
    onSubmit({ ...rest, prices: flattenPriceGroups(priceGroups) });
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {serverError && (
          <Alert variant="destructive">
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="description"
            label="Descripción"
            control={form.control}
            placeholder="Ej: Láminas de Seguridad"
            uppercase
            required
          />

          <FormInput
            name="code"
            label="Código (automático)"
            value={previewCode}
            disabled
            description="Se genera solo a partir de la descripción."
          />

          <FormSelect
            name="type_operation_id"
            label="Tipo de Operación"
            placeholder="Selecciona un tipo de operación"
            options={typeOperationOptions}
            control={form.control}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Precios por carrocería</p>
              <p className="text-xs text-muted-foreground">
                Agrupa las carrocerías que comparten el mismo monto (Autos,
                Camionetas / Pick Up, SUV 3 filas, VAN, etc.).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => append({ body_type_ids: [], price: 0 })}
            >
              <Plus className="h-4 w-4" />
              Agregar grupo de precio
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-xs text-destructive">
              Agrega al menos un grupo de precio.
            </p>
          )}

          {fields.map((field, index) => {
            const current: number[] = groups[index]?.body_type_ids ?? [];
            const takenElsewhere = new Set(
              groups.flatMap((g, i) =>
                i === index ? [] : g.body_type_ids ?? [],
              ),
            );
            const options = typesBody.filter(
              (item) =>
                current.includes(item.id) || !takenElsewhere.has(item.id),
            );

            return (
              <div
                key={field.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-start rounded-lg bg-muted/40 p-3"
              >
                <MultiSelectTags
                  control={form.control}
                  name={`priceGroups.${index}.body_type_ids`}
                  label="Carrocerías"
                  placeholder="Selecciona carrocerías"
                  options={options}
                  getDisplayValue={(item) =>
                    `${item.code} - ${item.description}`
                  }
                  required
                />
                <FormInput
                  name={`priceGroups.${index}.price`}
                  label="Precio"
                  control={form.control}
                  placeholder="Ej: 390"
                  type="number"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
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
            {isSubmitting ? "Guardando" : "Guardar Accesorio"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
