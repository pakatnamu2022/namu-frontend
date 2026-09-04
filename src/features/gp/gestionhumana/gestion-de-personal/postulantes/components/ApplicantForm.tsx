"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader, IdCard, Phone, MapPin, GraduationCap, Car, Briefcase } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useRecruitmentProcesses } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.hook";
import {
  ApplicantSchema,
  applicantSchemaCreate,
  applicantSchemaUpdate,
} from "../lib/applicant.schema.ts";
import { APPLICANT } from "../lib/applicant.constant.ts";
import { Option } from "@/core/core.interface.ts";

const SEXO_OPTIONS = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
];

interface ApplicantFormProps {
  defaultValues: Partial<ApplicantSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  defaultProcessOption?: Option;
}

export const ApplicantForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  defaultProcessOption,
}: ApplicantFormProps) => {
  const { ABSOLUTE_ROUTE } = APPLICANT;

  const form = useForm<any>({
    resolver: zodResolver(
      mode === "create" ? applicantSchemaCreate : applicantSchemaUpdate,
    ) as any,
    defaultValues: {
      proceso_postulacion_id: "",
      nombre_completo: "",
      vat: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  const useOpenProcesses = (params: Record<string, any>) =>
    useRecruitmentProcesses({ ...params, status_id: undefined });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <GroupFormSection title="Proceso de Postulación" icon={Briefcase} color="blue" cols={{ sm: 1 }}>
          <FormSelectAsync
            control={form.control}
            name="proceso_postulacion_id"
            label="Proceso"
            placeholder="Seleccionar proceso..."
            useQueryHook={useOpenProcesses}
            mapOptionFn={(p) => ({
              value: String(p.id),
              label: p.nombre_postulacion,
              description: [p.sede, p.cargo].filter(Boolean).join(" · "),
            })}
            defaultOption={defaultProcessOption}
            disabled={mode === "update"}
            required
          />
        </GroupFormSection>

        <GroupFormSection title="Identidad" icon={IdCard} color="violet" cols={{ sm: 2, md: 3 }}>
          <FormInput control={form.control} name="nombre_completo" label="Nombre completo" required />
          <FormInput control={form.control} name="vat" label="DNI / Documento" required />
          <FormInput control={form.control} name="vat2" label="Brevete" />
          <FormInput control={form.control} name="vat3" label="Pasaporte / C.E." />
          <FormSelect control={form.control} name="sexo" label="Sexo" placeholder="Seleccionar..." options={SEXO_OPTIONS} />
          <DatePickerFormField control={form.control} name="fecha_nacimiento" label="Fecha de nacimiento" />
          <FormInput control={form.control} name="nacionalidad" label="Nacionalidad" />
          <FormInput control={form.control} name="lugar_nacimiento" label="Lugar de nacimiento" />
          <FormInput control={form.control} name="estado_civil" label="Estado civil" />
          <DatePickerFormField control={form.control} name="fecha_estado_civil" label="Fecha estado civil" />
        </GroupFormSection>

        <GroupFormSection title="Contacto" icon={Phone} color="slate" cols={{ sm: 2, md: 3 }}>
          <FormInput control={form.control} name="email" label="Correo electrónico" />
          <FormInput control={form.control} name="cel_personal" label="Celular personal" />
          <FormInput control={form.control} name="cel_refencia" label="Celular de referencia" />
          <FormInput control={form.control} name="tel_referencia_2" label="Teléfono referencia 2" />
        </GroupFormSection>

        <GroupFormSection title="Domicilio" icon={MapPin} color="green" cols={{ sm: 2, md: 3 }}>
          <FormInput control={form.control} name="direccion_principal" label="Dirección principal" />
          <FormInput control={form.control} name="direccion_ref" label="Referencia" />
          <FormInput control={form.control} name="distrito" label="Distrito" />
          <FormInput control={form.control} name="provincia" label="Provincia" />
          <FormInput control={form.control} name="departamento" label="Departamento" />
        </GroupFormSection>

        <GroupFormSection title="Brevete / MATPEL" icon={Car} color="red" cols={{ sm: 2, md: 3 }}>
          <FormInput control={form.control} name="brevete_matpel" label="Brevete MATPEL" />
          <FormInput control={form.control} name="clase_brev" label="Clase" />
          <FormInput control={form.control} name="categoria_brev" label="Categoría" />
        </GroupFormSection>

        <GroupFormSection title="Educación" icon={GraduationCap} color="violet" cols={{ sm: 2, md: 3 }}>
          <FormInput control={form.control} name="institucion_tec_univ" label="Institución (téc./univ.)" />
          <FormInput control={form.control} name="carrera_tec_univ" label="Carrera" />
          <FormInput control={form.control} name="nivel_alcanzado" label="Nivel alcanzado" />
          <FormInput control={form.control} name="grado_obtenido" label="Grado obtenido" />
        </GroupFormSection>

        <div className="flex gap-4 w-full justify-end">
          <Link to={ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`} />
            {isSubmitting ? "Guardando" : "Guardar Postulante"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
