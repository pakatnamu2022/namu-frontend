"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStoreWorkOrderLabour } from "../lib/workOrderLabour.hook";
import { WorkOrderLabourRequest } from "../lib/workOrderLabour.interface";
import {
  createWorkOrderLabourSchema,
  WorkOrderLabourFormValues,
} from "../lib/workOrderLabour.schema";
import { FormInput } from "@/shared/components/FormInput";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { FormSelect } from "@/shared/components/FormSelect";
import { WorkOrderItemResource } from "../../orden-trabajo-item/lib/workOrderItem.interface";
import { CURRENCY_TYPE_IDS } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.constants";
import {
  DESCRIPTION_DEDUCTIBLE_KEYWORD,
  DESCRIPTION_MATERIALES,
  LABOUR_TYPE_DEDUCTIBLE,
  LABOUR_TYPE_LABOR,
  LABOUR_TYPE_MATERIAL,
  LABOUR_TYPE_OPTIONS,
} from "../lib/workOrderLabour.constants";
interface WorkOrderLabourFormProps {
  workOrderId: number;
  groupNumber: number;
  onSuccess: () => void;
  onCancel: () => void;
  workOrderItems?: WorkOrderItemResource[];
  currencyId?: number;
  costManHours: number;
  maxDiscountPercentage: number;
}

export default function WorkOrderLabourForm({
  workOrderId,
  groupNumber,
  onSuccess,
  onCancel,
  workOrderItems = [],
  currencyId,
  costManHours,
  maxDiscountPercentage,
}: WorkOrderLabourFormProps) {
  const storeMutation = useStoreWorkOrderLabour();

  const form = useForm<WorkOrderLabourFormValues>({
    resolver: zodResolver(createWorkOrderLabourSchema(maxDiscountPercentage)),
    mode: "onChange", // Validar en tiempo real
    defaultValues: {
      description: "",
      time_spent: "",
      hourly_rate: costManHours.toString(),
      discount_percentage: "0",
      work_order_id: workOrderId.toString(),
      group_number: groupNumber,
      labour_type: LABOUR_TYPE_LABOR,
    },
  });

  // Crear opciones de descripción a partir de los items de la orden de trabajo
  const descriptionOptions = useMemo(() => {
    return [
      ...workOrderItems.map((item) => ({
        label: item.description,
        value: item.description,
        description: item.type_planning.description,
      })),
      {
        label: DESCRIPTION_MATERIALES,
        value: DESCRIPTION_MATERIALES,
        description: "",
      },
    ];
  }, [workOrderItems]);

  const description = form.watch("description");
  // El usuario puede sobreescribir el tipo manualmente; a partir de ahí dejamos de auto-calcularlo.
  const isTypeManuallySet = useRef(false);

  useEffect(() => {
    if (isTypeManuallySet.current) return;

    const autoType = description
      ?.toUpperCase()
      .includes(DESCRIPTION_DEDUCTIBLE_KEYWORD)
      ? LABOUR_TYPE_DEDUCTIBLE
      : description === DESCRIPTION_MATERIALES
        ? LABOUR_TYPE_MATERIAL
        : LABOUR_TYPE_LABOR;

    form.setValue("labour_type", autoType, { shouldValidate: true });
  }, [description, form]);

  const onSubmit = (data: WorkOrderLabourFormValues) => {
    const payload: WorkOrderLabourRequest = {
      description: data.description,
      time_spent: data.time_spent,
      hourly_rate: data.hourly_rate,
      discount_percentage: String(data.discount_percentage),
      work_order_id: data.work_order_id,
      worker_id: Number(data.worker_id),
      group_number: data.group_number,
      labour_type: data.labour_type,
    };

    storeMutation.mutate(payload, {
      onSuccess: () => {
        form.reset();
        onSuccess();
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          <div className="sm:col-span-2">
            <FormCombobox
              name="description"
              label="Descripción"
              placeholder="Seleccione o escriba una descripción..."
              options={descriptionOptions}
              control={form.control}
              allowCreate={true}
            />
          </div>

          <FormSelect
            name="labour_type"
            label="Tipo"
            options={LABOUR_TYPE_OPTIONS}
            control={form.control}
            onValueChange={() => {
              isTypeManuallySet.current = true;
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start">
          <FormInput
            name="time_spent"
            label="Horas"
            placeholder="Ej: 2.5"
            control={form.control}
          />

          <FormInput
            name="hourly_rate"
            label={`Tarifa/Hora (S/.)`}
            placeholder="Ej: 50.00"
            control={form.control}
            description={
              currencyId === Number(CURRENCY_TYPE_IDS.DOLLARS)
                ? "Ingresa la tarifa en soles, el sistema la convertirá automáticamente"
                : undefined
            }
          />

          <FormInput
            name="discount_percentage"
            label={`Descuento (% máx: ${maxDiscountPercentage})`}
            placeholder="0.0"
            type="number"
            min={0}
            max={maxDiscountPercentage}
            step="0.01"
            control={form.control}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} size="sm">
            Cancelar
          </Button>
          <Button type="submit" disabled={storeMutation.isPending} size="sm">
            {storeMutation.isPending ? "Guardando..." : "Agregar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
