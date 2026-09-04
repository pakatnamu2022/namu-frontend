"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Loader,
  IdCard,
  Phone,
  MapPin,
  GraduationCap,
  Car,
  Briefcase,
} from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useRecruitmentProcesses } from "@/features/gp/gestionhumana/gestion-de-personal/procesos-postulacion/lib/recruitmentProcess.hook";
import { useDniValidation } from "@/shared/hooks/useDocumentValidation";
import { DocumentValidationStatus } from "@/shared/components/DocumentValidationStatus";
import { ValidationIndicator } from "@/shared/components/ValidationIndicator";
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

const NUM_DIGITS_DNI = 8;

// Factiliza/RENIEC devuelve la fecha como "DD/MM/YYYY"; nuestro DatePicker espera "YYYY-MM-DD".
function toIsoDate(value?: string | null): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

interface ApplicantFormProps {
  defaultValues: Partial<ApplicantSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  defaultProcessOption?: Option;
  lockProcess?: boolean;
  cancelRoute?: string;
}

export const ApplicantForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  defaultProcessOption,
  lockProcess = false,
  cancelRoute,
}: ApplicantFormProps) => {
  const { ABSOLUTE_ROUTE } = APPLICANT;
  // En edición no se debe disparar la consulta a RENIEC ni sobrescribir los
  // datos ya guardados al abrir el formulario.
  const [isFirstLoad, setIsFirstLoad] = useState(mode === "update");

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

  const vat = form.watch("vat");
  // En edición, solo se dispara la consulta automática cuando el usuario
  // realmente cambia el DNI guardado, no al cargar el formulario.
  const initialVatRef = useRef(defaultValues.vat ?? "");
  useEffect(() => {
    if (isFirstLoad && vat !== initialVatRef.current) {
      setIsFirstLoad(false);
    }
  }, [vat, isFirstLoad]);

  const shouldTriggerDni = !isFirstLoad && vat?.length === NUM_DIGITS_DNI;

  const {
    data: dniData,
    isLoading: isDniLoading,
    error: dniError,
  } = useDniValidation(vat, shouldTriggerDni, false);

  // Auto-completa los datos personales apenas RENIEC responde, sin necesidad
  // de un botón de búsqueda (mismo patrón que CustomersForm).
  useEffect(() => {
    if (isFirstLoad) return;

    if (dniData?.success && dniData.data) {
      const p = dniData.data;
      form.setValue("nombre_completo", p.names ?? "", {
        shouldValidate: true,
      });
      if (p.gender) form.setValue("sexo", p.gender);
      const birthDate = toIsoDate(p.birth_date);
      if (birthDate) form.setValue("fecha_nacimiento", birthDate);
      if (p.department) form.setValue("departamento", p.department);
      if (p.province) form.setValue("provincia", p.province);
      if (p.district) form.setValue("distrito", p.district);
      if (p.address) form.setValue("direccion_principal", p.address);
    } else if (dniData && !dniData.success) {
      form.setValue("nombre_completo", "", { shouldValidate: true });
    }
  }, [dniData, isFirstLoad, form]);

  const shouldDisablePersonalFields = Boolean(dniData?.success && dniData.data);

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
            disabled={mode === "update" || lockProcess}
            required
          />
        </GroupFormSection>

        <GroupFormSection title="Identidad" icon={IdCard} color="violet" cols={{ sm: 2, md: 3 }}>
          <FormInput
            control={form.control}
            name="vat"
            label={
              <div className="flex items-center justify-between gap-2 w-full">
                DNI / Documento
                <DocumentValidationStatus
                  shouldValidate
                  documentNumber={vat ?? ""}
                  expectedDigits={NUM_DIGITS_DNI}
                  isValidating={isDniLoading}
                />
              </div>
            }
            required
            inputMode="numeric"
            maxLength={NUM_DIGITS_DNI}
            onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
              e.target.value = e.target.value.replace(/\D/g, "");
            }}
            addonEnd={
              <ValidationIndicator
                show={!!vat}
                isValidating={isDniLoading}
                isValid={!!dniData?.success && !!dniData.data}
                hasError={!!dniError || (dniData && !dniData.success)}
              />
            }
          />
          <FormInput
            control={form.control}
            name="nombre_completo"
            label="Nombre completo"
            required
            disabled={shouldDisablePersonalFields}
          />
          <FormInput control={form.control} name="vat2" label="Brevete" />
          <FormInput control={form.control} name="vat3" label="Pasaporte / C.E." />
          <FormSelect
            control={form.control}
            name="sexo"
            label="Sexo"
            placeholder="Seleccionar..."
            options={SEXO_OPTIONS}
            disabled={shouldDisablePersonalFields}
          />
          <DatePickerFormField
            control={form.control}
            name="fecha_nacimiento"
            label="Fecha de nacimiento"
            disabled={shouldDisablePersonalFields}
          />
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
          <FormInput
            control={form.control}
            name="direccion_principal"
            label="Dirección principal"
            disabled={shouldDisablePersonalFields}
          />
          <FormInput control={form.control} name="direccion_ref" label="Referencia" />
          <FormInput
            control={form.control}
            name="distrito"
            label="Distrito"
            disabled={shouldDisablePersonalFields}
          />
          <FormInput
            control={form.control}
            name="provincia"
            label="Provincia"
            disabled={shouldDisablePersonalFields}
          />
          <FormInput
            control={form.control}
            name="departamento"
            label="Departamento"
            disabled={shouldDisablePersonalFields}
          />
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
          <Link to={cancelRoute ?? ABSOLUTE_ROUTE}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || !form.formState.isValid || isDniLoading}>
            <Loader className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : "animate-spin"}`} />
            {isSubmitting ? "Guardando" : "Guardar Postulante"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
