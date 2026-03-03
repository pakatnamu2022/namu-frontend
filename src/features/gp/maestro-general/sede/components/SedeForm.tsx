import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import FormSkeleton from "@/shared/components/FormSkeleton";
import {
  SedeSchema,
  sedeSchemaCreate,
  sedeSchemaUpdate,
} from "../lib/sede.schema";

import { useEffect } from "react";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import {
  useAllDepartment,
  useAllDistrict,
  useAllProvince,
} from "../../../gestionsistema/ubicaciones/lib/location.hook";
import { SEDE } from "../lib/sede.constants";
import { FormSwitch } from "@/shared/components/FormSwitch";

interface SedeFormProps {
  defaultValues: Partial<SedeSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const SedeForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: SedeFormProps) => {
  const { ABSOLUTE_ROUTE } = SEDE;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? sedeSchemaCreate : sedeSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const companyId = form.watch("empresa_id");
  const name = form.watch("suc_abrev");
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useAllCompanies();

  const { data: departments = [], isLoading: isLoadingDepartments } =
    useAllDepartment();

  const selectedDepartmentId = form.watch("department_id");
  const selectedProvinceId = form.watch("province_id");

  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useAllProvince({
      department_id: selectedDepartmentId,
    });

  const { data: districts = [], isLoading: isLoadingDistricts } =
    useAllDistrict({
      province_id: selectedProvinceId,
    });

  useEffect(() => {
    if (name && companyId) {
      const company = companies.find(
        (company) => company.id === parseInt(companyId),
      );
      if (company) {
        const abbreviation = `${company.abbreviation}_${name
          .replace(/\s+/g, "_")
          .toUpperCase()}`;
        form.setValue("abreviatura", abbreviation);
      }
    } else {
      form.setValue("abreviatura", "");
    }
  }, [name, companyId, companies, form]);

  useEffect(() => {
    if (mode === "create" && selectedDepartmentId) {
      form.setValue("province_id", "");
      form.setValue("district_id", "");
    } else if (selectedDepartmentId !== defaultValues.department_id) {
      form.setValue("province_id", "");
      form.setValue("district_id", "");
    }
  }, [selectedDepartmentId, form, mode, defaultValues.department_id]);

  useEffect(() => {
    if (mode === "create" && selectedProvinceId) {
      form.setValue("district_id", "");
    }
  }, [selectedProvinceId, form, mode]);

  if (isLoadingCompanies || isLoadingDepartments) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormSelect
            name="empresa_id"
            label="Empresa"
            placeholder="Selecciona Empresa"
            options={companies.map((company) => ({
              label: company.name,
              value: company.id.toString(),
            }))}
            control={form.control}
          />
          <FormInput
            control={form.control}
            name="suc_abrev"
            label="Nombre"
            placeholder="Ej: TP_CHICLAYO_01"
          />
          <FormInput
            control={form.control}
            name="abreviatura"
            label="Abreviatura"
            placeholder="Ej: TP_CHI_01"
            disabled
          />
          <FormInput
            control={form.control}
            name="dyn_code"
            label="Cod. Dynamic"
            placeholder="Ej: TP1"
          />
          <FormInput
            control={form.control}
            name="establishment"
            label="Establecimiento"
            placeholder="Ej: Transportes Pakatnamú"
          />
          <FormInput
            control={form.control}
            name="direccion"
            label="Dirección"
            placeholder="Ej: CARRETERA LAMBAYEQUE Mz. A Lote 06 Km. 4.5 - LAMBAYEQUE"
          />
          <FormSelect
            name="department_id"
            label="Departamento"
            placeholder="Selecciona un Departamento"
            options={departments.map((department) => ({
              label: department.name,
              value: department.id.toString(),
            }))}
            control={form.control}
          />
          <FormSelect
            name="province_id"
            label="Provincia"
            placeholder={
              !selectedDepartmentId
                ? "Seleccione Departamento"
                : isLoadingProvinces
                  ? "Cargando..."
                  : "Selecciona una Provincia"
            }
            options={provinces.map((province) => ({
              label: province.name,
              value: province.id.toString(),
            }))}
            control={form.control}
            disabled={!selectedDepartmentId || isLoadingProvinces}
          />
          <FormSelect
            name="district_id"
            label="Distrito"
            placeholder={
              !selectedProvinceId
                ? "Seleccione Provincia"
                : isLoadingDistricts
                  ? "Cargando..."
                  : "Selecciona un Distrito"
            }
            options={districts.map((district) => ({
              label: district.name,
              value: district.id.toString(),
            }))}
            control={form.control}
            disabled={!selectedProvinceId || isLoadingDistricts}
          />
          <FormSwitch
            name="has_workshop"
            label="¿Tiene Taller?"
            text={form.watch("has_workshop") ? "Sí" : "No"}
            control={form.control}
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
            {isSubmitting ? "Guardando" : "Guardar Sede"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
