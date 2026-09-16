"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader, ClipboardList, MapPin, UserCog } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAreas } from "@/features/gp/gestionhumana/gestion-de-personal/areas/lib/area.hook";
import { usePositions } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.hook";
import { useUsers } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import {
  RecruitmentProcessSchema,
  recruitmentProcessSchemaCreate,
  recruitmentProcessSchemaUpdate,
} from "../lib/recruitmentProcess.schema.ts";
import { RECRUITMENT_PROCESS } from "../lib/recruitmentProcess.constant.ts";
import { Option } from "@/core/core.interface.ts";
import { useEffect, useRef } from "react";

interface RecruitmentProcessFormProps {
  defaultValues: Partial<RecruitmentProcessSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  defaultOptions?: {
    area?: Option;
    cargo?: Option;
    solicitante?: Option;
  };
}

export const RecruitmentProcessForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  defaultOptions,
}: RecruitmentProcessFormProps) => {
  const { ABSOLUTE_ROUTE } = RECRUITMENT_PROCESS;

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create"
        ? recruitmentProcessSchemaCreate
        : recruitmentProcessSchemaUpdate,
    ) as any,
    defaultValues: {
      nombre_postulacion: "",
      cant_trab_solicita: 1,
      sede_id: "",
      area_id: "",
      cargo_id: "",
      fecha_inicio: "",
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

  const sedeId = form.watch("sede_id");
  const areaId = form.watch("area_id");

  const useAreasBySede = (params: Record<string, any>) =>
    useAreas({ ...params, sede_id: sedeId || undefined });
  const usePositionsByArea = (params: Record<string, any>) =>
    usePositions({ ...params, area_id: areaId || undefined });

  // Al cambiar la sede, limpiar área y cargo (salvo la carga inicial en edición).
  const prevSedeId = useRef(sedeId);
  useEffect(() => {
    if (prevSedeId.current !== sedeId) {
      prevSedeId.current = sedeId;
      form.setValue("area_id", "");
      form.setValue("cargo_id", "");
    }
  }, [sedeId, form]);

  const prevAreaId = useRef(areaId);
  useEffect(() => {
    if (prevAreaId.current !== areaId) {
      prevAreaId.current = areaId;
      form.setValue("cargo_id", "");
    }
  }, [areaId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection
          title="Datos del Proceso"
          icon={ClipboardList}
          color="blue"
          cols={{ sm: 2 }}
        >
          <FormInput
            control={form.control}
            name="nombre_postulacion"
            label="Nombre de la postulación"
            required
            placeholder="Ej: Asesor Comercial - Chiclayo"
          />
          <FormInput
            control={form.control}
            name="cant_trab_solicita"
            label="Cantidad de trabajadores solicitados"
            type="number"
            min="1"
            required
          />
          <DatePickerFormField
            control={form.control}
            name="fecha_inicio"
            label="Fecha de inicio"
          />
        </GroupFormSection>

        <GroupFormSection
          title="Ubicación y Cargo"
          icon={MapPin}
          color="violet"
          cols={{ sm: 2 }}
        >
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
            name="area_id"
            label="Área"
            placeholder="Seleccionar área..."
            useQueryHook={useAreasBySede}
            mapOptionFn={(area) => ({
              value: String(area.id),
              label: area.name,
              description: area.sede || "",
            })}
            additionalParams={{ sede_id: sedeId || undefined }}
            defaultOption={defaultOptions?.area}
            disabled={!sedeId}
            required
          />
          <FormSelectAsync
            control={form.control}
            name="cargo_id"
            label="Cargo"
            placeholder="Seleccionar cargo..."
            useQueryHook={usePositionsByArea}
            mapOptionFn={(pos) => ({
              value: String(pos.id),
              label: pos.name,
              description: pos.area || "",
            })}
            additionalParams={{ area_id: areaId || undefined }}
            defaultOption={defaultOptions?.cargo}
            disabled={!areaId}
            required
          />
        </GroupFormSection>

        <GroupFormSection
          title="Solicitante y prioridad"
          icon={UserCog}
          color="amber"
          cols={{ sm: 2 }}
        >
          <FormSelectAsync
            control={form.control}
            name="solicitante_id"
            label="Solicitante / Jefatura"
            placeholder="Seleccionar solicitante..."
            useQueryHook={useUsers}
            mapOptionFn={(u) => ({
              value: String(u.id),
              label: u.name,
              description: u.position || "",
            })}
            defaultOption={defaultOptions?.solicitante}
          />
          <FormInput
            control={form.control}
            name="prioridad"
            label="Prioridad"
            type="number"
            min="0"
            max="255"
          />
        </GroupFormSection>

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
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Proceso"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
