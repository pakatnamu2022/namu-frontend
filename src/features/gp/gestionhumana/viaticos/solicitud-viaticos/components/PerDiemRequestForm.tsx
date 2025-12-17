"use client";

import { useForm } from "react-hook-form";
import {
  PerDiemRequestSchema,
  PerDiemRequestSchemaUpdate,
  perDiemRequestSchemaCreate,
  perDiemRequestSchemaUpdate,
} from "../lib/perDiemRequest.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { useGetAllPerDiemCategory } from "../../categoria-viaticos/lib/perDiemCategory.hook";
import { useUserCompanies } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { useAllDistrict } from "@/features/gp/gestionsistema/ubicaciones/lib/location.hook";

interface PerDiemRequestFormProps {
  defaultValues: Partial<PerDiemRequestSchema | PerDiemRequestSchemaUpdate>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
}

export const PerDiemRequestForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
}: PerDiemRequestFormProps) => {
  const form = useForm<PerDiemRequestSchema | PerDiemRequestSchemaUpdate>({
    resolver: zodResolver(
      mode === "create"
        ? perDiemRequestSchemaCreate
        : perDiemRequestSchemaUpdate
    ) as any,
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { data: perDiemCategory = [], isLoading: isLoadingPerDiemCategory } =
    useGetAllPerDiemCategory();
  const { data: myCompanies = [], isLoading: isLoadingMyCompanies } =
    useUserCompanies();
  const { data: districts = [], isLoading: isLoadingDistricts } =
    useAllDistrict();

  useEffect(() => {
    if (mode === "update" && Object.keys(defaultValues).length > 0) {
      form.reset(defaultValues, {
        keepDefaultValues: true,
      });
      setTimeout(() => {
        form.trigger();
      }, 0);
    }
  }, [defaultValues, mode, form]);

  // Seleccionar automáticamente la empresa si solo hay una
  useEffect(() => {
    if (myCompanies.length === 1 && !form.getValues("company_id")) {
      form.setValue("company_id", myCompanies[0].id.toString());
    }
  }, [myCompanies, form]);

  if (isLoadingPerDiemCategory || isLoadingMyCompanies || isLoadingDistricts)
    return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            name="company_id"
            label="Empresa"
            placeholder="Selecciona una empresa"
            options={myCompanies
              .filter((item) => item?.id && item?.name)
              .map((item) => ({
                label: item.name,
                value: item.id.toString(),
              }))}
            control={form.control}
          />

          <FormSelect
            name="per_diem_category_id"
            label="Categoría de Viáticos"
            placeholder="Selecciona una categoría"
            options={perDiemCategory.map((item) => ({
              label: item.name,
              value: item.id.toString(),
            }))}
            control={form.control}
          />

          <DatePickerFormField
            control={form.control}
            name="start_date"
            label="Fecha de Inicio"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{
              before: new Date(),
            }}
          />

          <DatePickerFormField
            control={form.control}
            name="end_date"
            label="Fecha de Fin"
            placeholder="Selecciona una fecha"
            dateFormat="dd/MM/yyyy"
            captionLayout="dropdown"
            disabledRange={{
              before: form.watch("start_date")
                ? new Date(form.watch("start_date"))
                : new Date(),
            }}
          />
        </div>

        <FormSelect
          name="district_id"
          label="Ubigeo"
          placeholder="Selecciona ubigeo"
          options={districts.map((item) => ({
            label: item.name + " - " + item.ubigeo,
            value: item.id.toString(),
          }))}
          control={form.control}
          strictFilter={true}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Propósito</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describa el propósito del viático..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "update" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="approved">Aprobado</SelectItem>
                        <SelectItem value="rejected">Rechazado</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_spent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Gastado</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="balance_to_return"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Saldo a Devolver</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="paid"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pagado</FormLabel>
                      <FormDescription>
                        Marcar si el viático ha sido pagado
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Liquidado</FormLabel>
                      <FormDescription>
                        Marcar si el viático ha sido liquidado
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerFormField
                control={form.control}
                name="payment_date"
                label="Fecha de Pago"
                placeholder="Selecciona una fecha"
                dateFormat="dd/MM/yyyy"
                captionLayout="dropdown"
              />

              <DatePickerFormField
                control={form.control}
                name="settlement_date"
                label="Fecha de Liquidación"
                placeholder="Selecciona una fecha"
                dateFormat="dd/MM/yyyy"
                captionLayout="dropdown"
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones o notas adicionales sobre esta solicitud..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 w-full justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 animate-spin ${
                !isSubmitting ? "hidden" : ""
              }`}
            />
            {isSubmitting ? "Guardando..." : "Guardar Solicitud"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
