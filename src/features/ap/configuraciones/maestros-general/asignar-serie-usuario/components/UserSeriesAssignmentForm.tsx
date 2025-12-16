"use client";

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
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Link } from "react-router-dom";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/shared/components/FormSelect";
import { CheckIcon } from "lucide-react";
import {
  Tags,
  TagsContent,
  TagsEmpty,
  TagsGroup,
  TagsInput,
  TagsItem,
  TagsList,
  TagsTrigger,
  TagsValue,
} from "@/shared/components/Tags";
import { EMPRESA_AP } from "@/core/core.constants";
import {
  UserSeriesAssignmentSchema,
  userSeriesAssignmentSchemaCreate,
  userSeriesAssignmentSchemaUpdate,
} from "../lib/userSeriesAssignment.schema";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { useAllAssignSalesSeries } from "../../asignar-serie-venta/lib/assignSalesSeries.hook";
import { VouchersResource } from "../lib/userSeriesAssignment.interface";
import { useAllUsers } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { USER_SERIES_ASSIGNMENT } from "../lib/userSeriesAssignment.constants";

interface UserSeriesAssignmentFormProps {
  defaultValues: Partial<UserSeriesAssignmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const UserSeriesAssignmentForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: UserSeriesAssignmentFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? userSeriesAssignmentSchemaCreate
        : userSeriesAssignmentSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = USER_SERIES_ASSIGNMENT;

  const { data: users = [], isLoading: isLoadingUsers } = useAllUsers({
    person$cargo_id: [
      ...POSITION_TYPE.BOX_OFFICE,
      ...POSITION_TYPE.SALES_COORDINATOR,
      ...POSITION_TYPE.TICS,
      ...POSITION_TYPE.PDI,
    ],
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  const { data: vouchers = [], isLoading: isLoadingVouchers } =
    useAllAssignSalesSeries();

  if (isLoadingVouchers || isLoadingUsers) {
    return <FormSkeleton />;
  }

  const handleSubmit = (data: any) => {
    const payload = {
      worker_id: Number(data.worker_id),
      vouchers: data.vouchers.map((voucher: VouchersResource) => voucher.id),
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormSelect
            name="worker_id"
            label="Trabajador"
            placeholder="Selecciona un trabajador"
            options={users.map((worker) => ({
              label: worker.name,
              value: worker.id.toString(),
            }))}
            control={form.control}
            disabled={mode === "update"}
          />

          {/* Campo de selección multiple */}
          <FormField
            control={form.control}
            name="vouchers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprobantes</FormLabel>
                <FormControl>
                  <Tags
                    className="max-w-full"
                    value={field.value ?? []}
                    setValue={field.onChange}
                  >
                    <TagsTrigger placeholder="Selecciona los comprobantes">
                      {(field.value ?? []).map(
                        (comprobante: VouchersResource) => (
                          <TagsValue
                            key={comprobante.id}
                            onRemove={() =>
                              field.onChange(
                                (field.value ?? []).filter(
                                  (a: { id: number }) => a.id !== comprobante.id
                                )
                              )
                            }
                          >
                            {comprobante.series} - {comprobante.type_receipt} -{" "}
                            {comprobante.type_operation}-{comprobante.sede}
                          </TagsValue>
                        )
                      )}
                    </TagsTrigger>
                    <TagsContent>
                      <TagsInput placeholder="Buscar comprobante..." />
                      <TagsList>
                        <TagsEmpty>No se encontro comprobante.</TagsEmpty>
                        <TagsGroup>
                          {vouchers.map((comprobante) => (
                            <TagsItem
                              key={comprobante.id}
                              onSelect={() => {
                                if (
                                  !(field.value ?? []).some(
                                    (a: { id: number }) =>
                                      a.id === comprobante.id
                                  )
                                ) {
                                  field.onChange([
                                    ...(field.value ?? []),
                                    comprobante,
                                  ]);
                                }
                              }}
                              value={comprobante.series}
                            >
                              {comprobante.series} - {comprobante.type_receipt}{" "}
                              - {comprobante.type_operation} -{" "}
                              {comprobante.sede}{" "}
                              {(field.value ?? []).some(
                                (a: { id: number }) => a.id === comprobante.id
                              ) && (
                                <CheckIcon
                                  className="text-muted-foreground"
                                  size={14}
                                />
                              )}
                            </TagsItem>
                          ))}
                        </TagsGroup>
                      </TagsList>
                    </TagsContent>
                  </Tags>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
            {isSubmitting ? "Guardando" : "Guardar Asignación"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
