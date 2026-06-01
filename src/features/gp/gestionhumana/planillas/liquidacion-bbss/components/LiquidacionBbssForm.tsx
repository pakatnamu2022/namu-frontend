"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  LiquidacionBbssSchema,
  liquidacionBbssSchema,
} from "../lib/liquidacion-bbss.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { LIQUIDACION_BBSS } from "../lib/liquidacion-bbss.constant";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import { useGpMasters } from "@/features/gp/gp-master/lib/gpMaster.hook";
import { GP_MASTER_TYPE } from "@/features/gp/gp-master/lib/gpMaster.constants";
import { Option } from "@/core/core.interface";

interface LiquidacionBbssFormProps {
  defaultValues: Partial<LiquidacionBbssSchema>;
  onSubmit: (data: LiquidacionBbssSchema) => void;
  isSubmitting?: boolean;
}

export const LiquidacionBbssForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: LiquidacionBbssFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = LIQUIDACION_BBSS;

  const form = useForm<LiquidacionBbssSchema>({
    resolver: zodResolver(liquidacionBbssSchema) as any,
    defaultValues: {
      worker_id: defaultValues.worker_id ?? undefined,
      period_id: defaultValues.period_id ?? undefined,
      amount: defaultValues.amount ?? "",
      type_id: defaultValues.type_id ?? undefined,
    },
    mode: "onChange",
  });

  const { data: gpMastersData } = useGpMasters({
    params: { type: GP_MASTER_TYPE.PAYROLL_LIQUIDATION_BBSS_TYPE },
  });

  const typeOptions: Option[] = (gpMastersData?.data ?? []).map((item) => ({
    label: item.description,
    value: String(item.id),
  }));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormSelectAsync
            name="worker_id"
            label="Trabajador"
            placeholder="Seleccione trabajador"
            control={form.control}
            required
            useQueryHook={useWorkers}
            mapOptionFn={(item) => ({
              label: item.name,
              value: String(item.id),
            })}
          />

          <FormSelectAsync
            name="period_id"
            label="Periodo"
            placeholder="Seleccione periodo"
            control={form.control}
            required
            useQueryHook={usePayrollPeriods}
            mapOptionFn={(item) => ({
              label: item.name + " - " + item.company.name,
              value: String(item.id),
            })}
          />

          <FormInput
            name="amount"
            label="Monto"
            placeholder="Ej: 1500.00"
            control={form.control}
            required
          />

          <FormSelect
            name="type_id"
            label="Tipo"
            placeholder="Seleccione tipo"
            options={typeOptions}
            control={form.control}
            required
          />
        </div>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
