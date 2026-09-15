"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader, FileText, Users, PenTool } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePositions } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook";
import { useAllContractTypes } from "@/features/gp/gestionhumana/gestion-de-personal/tipos-contrato/lib/contractType.hook";
import { useAllContractTemplates } from "@/features/gp/gestionhumana/gestion-de-personal/plantillas-contrato/lib/contractTemplate.hook";
import { useAllSigners } from "@/features/gp/gestionhumana/gestion-de-personal/firmantes/lib/signer.hook";
import {
  ContractSchema,
  contractSchemaCreate,
  contractSchemaUpdate,
} from "../lib/contract.schema.ts";
import { CONTRACT } from "../lib/contract.constant.ts";
import { Option } from "@/core/core.interface.ts";

interface ContractFormProps {
  defaultValues: Partial<ContractSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  defaultOptions?: {
    empleado?: Option;
    cargo?: Option;
  };
}

export const ContractForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  defaultOptions,
}: ContractFormProps) => {
  const { ABSOLUTE_ROUTE } = CONTRACT;

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create" ? contractSchemaCreate : contractSchemaUpdate,
    ) as any,
    defaultValues: {
      empleado_id: "",
      tipo_contrato_id: "",
      template_contrato_id: "",
      sede_id: "",
      cargo_id: "",
      sueldo: "",
      fecha_inicio_actividades: "",
      fecha_inicio_contrato: "",
      fecha_fin_contrato: "",
      observacion: "",
      grupo_contrato: "",
      convenio: "",
      firmante_id: "",
      firmante_sec_id: "",
      lote: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { data: sedesData } = useAllSedes();
  const sedeOptions = (sedesData ?? []).map((s) => ({
    value: String(s.id),
    label: s.description,
    description: s.suc_abrev,
  }));

  const { data: contractTypes } = useAllContractTypes();
  const contractTypeOptions = (contractTypes ?? []).map((t) => ({
    value: String(t.id),
    label: t.descripcion,
  }));

  const { data: contractTemplates } = useAllContractTemplates();
  const contractTemplateOptions = (contractTemplates ?? []).map((t) => ({
    value: String(t.id),
    label: t.nombre,
  }));

  const { data: signers } = useAllSigners();
  const signerOptions = (signers ?? []).map((s) => ({
    value: String(s.id),
    label: s.nombre,
    description: s.sede_abreviatura,
  }));

  const convenio = form.watch("convenio");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection
          title="Trabajador y Contrato"
          icon={Users}
          color="blue"
          cols={{ sm: 2 }}
        >
          <FormSelectAsync
            control={form.control}
            name="empleado_id"
            label="Trabajador"
            placeholder="Seleccionar trabajador..."
            useQueryHook={useWorkers}
            mapOptionFn={(worker) => ({
              value: String(worker.id),
              label: worker.name,
              description: worker.document,
            })}
            defaultOption={defaultOptions?.empleado}
            required
          />
          <FormSelect
            control={form.control}
            name="tipo_contrato_id"
            label="Tipo de contrato"
            placeholder="Seleccionar tipo..."
            options={contractTypeOptions}
            required
          />
          <FormSelect
            control={form.control}
            name="template_contrato_id"
            label="Plantilla de contrato"
            placeholder="Seleccionar plantilla..."
            options={contractTemplateOptions}
            required
          />
          <FormSelect
            control={form.control}
            name="sede_id"
            label="Sede"
            placeholder="Seleccionar sede..."
            options={sedeOptions}
            required
          />
          <FormSelectAsync
            control={form.control}
            name="cargo_id"
            label="Cargo"
            placeholder="Seleccionar cargo..."
            useQueryHook={usePositions}
            mapOptionFn={(pos) => ({
              value: String(pos.id),
              label: pos.name,
              description: pos.area || "",
            })}
            defaultOption={defaultOptions?.cargo}
            required
          />
          <FormInput
            control={form.control}
            name="sueldo"
            label="Sueldo"
            type="number"
            min="0"
            step="0.01"
            required
          />
          <DatePickerFormField
            control={form.control}
            name="fecha_inicio_actividades"
            label="Fecha de inicio de actividades"
          />
          <DatePickerFormField
            control={form.control}
            name="fecha_inicio_contrato"
            label="Fecha de inicio del contrato"
          />
          <DatePickerFormField
            control={form.control}
            name="fecha_fin_contrato"
            label="Fecha de fin del contrato"
          />
          <FormInput
            control={form.control}
            name="grupo_contrato"
            label="Grupo de contrato"
            placeholder="Opcional"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Firma y Convenio"
          icon={PenTool}
          color="violet"
          cols={{ sm: 2 }}
        >
          <FormSelect
            control={form.control}
            name="firmante_id"
            label="Firmante"
            placeholder="Seleccionar firmante..."
            options={signerOptions}
          />
          <FormInput
            control={form.control}
            name="convenio"
            label="Convenio"
            placeholder='"SI" si aplica firmante secundario'
          />
          {convenio === "SI" && (
            <FormSelect
              control={form.control}
              name="firmante_sec_id"
              label="Firmante secundario"
              placeholder="Seleccionar firmante secundario..."
              options={signerOptions}
            />
          )}
          <FormInput
            control={form.control}
            name="lote"
            label="Lote"
            placeholder="Para firma masiva, opcional"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Observaciones"
          icon={FileText}
          color="slate"
          cols={{ sm: 1 }}
        >
          <FormTextArea
            control={form.control}
            name="observacion"
            label="Observación"
            rows={4}
          />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Contrato"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
