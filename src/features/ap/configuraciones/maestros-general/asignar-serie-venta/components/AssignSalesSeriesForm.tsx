import {
  AssignSalesSeriesSchema,
  assignSalesSeriesSchemaCreate,
  assignSalesSeriesSchemaUpdate,
} from "../lib/assignSalesSeries.schema";
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
import { Link } from 'react-router-dom'
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { useAllVoucherTypes } from "../../tipos-comprobante/lib/voucherTypes.hook";
import { useAllTypesOperation } from "../../tipos-operacion/lib/typesOperation.hook";

interface AssignSalesSeriesFormProps {
  defaultValues: Partial<AssignSalesSeriesSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const AssignSalesSeriesForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: AssignSalesSeriesFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? assignSalesSeriesSchemaCreate
        : assignSalesSeriesSchemaUpdate as any
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  const { data: typesOperation = [], isLoading: isLoadingTypesOperation } =
    useAllTypesOperation();

  const { data: typesReceipt = [], isLoading: isLoadingTypesReceipt } =
    useAllVoucherTypes();

  if (isLoadingSedes || isLoadingTypesReceipt || isLoadingTypesOperation)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="series"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: BV75" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="correlative_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correlativo Inicial</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="type_receipt_id"
            label="Tipo de Comprobante"
            placeholder="Selecciona una Tipo de Comprobante"
            options={typesReceipt.map((typeReceipt) => ({
              label: typeReceipt.description,
              value: typeReceipt.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="type_operation_id"
            label="Tipo de Operación"
            placeholder="Selecciona una Tipo de Operación"
            options={typesOperation.map((typeOperation) => ({
              label: typeOperation.description,
              value: typeOperation.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="sede_id"
            label="Sede"
            placeholder="Selecciona una Sede"
            options={sedes.map((sede) => ({
              label: sede.abreviatura,
              value: sede.id.toString(),
            }))}
            control={form.control}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={mode === "create" ? "" : "../"}>
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
            {isSubmitting ? "Guardando" : "Guardar Asignación de Serie"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
