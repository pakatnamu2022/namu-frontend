import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import {
  DistrictSchema,
  districtSchemaCreate,
  districtSchemaUpdate,
} from "../lib/district.schema";
import {
  useAllDepartment,
  useAllProvince,
} from "@/features/gp/gestionsistema/ubicaciones/lib/location.hook";
import { FormSelect } from "@/shared/components/FormSelect";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { DISTRICT } from "../lib/district.constants";
import { FormInput } from "@/shared/components/FormInput";

interface DistrictFormProps {
  defaultValues: Partial<DistrictSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const DistrictForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: DistrictFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? districtSchemaCreate : districtSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
  const { ABSOLUTE_ROUTE } = DISTRICT;
  const { data: departments = [], isLoading: isLoadingDepartments } =
    useAllDepartment();

  const selectedDepartmentId = form.watch("department_id");

  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useAllProvince({
      department_id: selectedDepartmentId,
    });

  if (isLoadingDepartments) return <FormSkeleton />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormInput
            control={form.control}
            name="name"
            label="Distrito"
            placeholder="Ej: Chiclayo"
          />

          <FormInput
            control={form.control}
            name="ubigeo"
            label="Ubigeo"
            placeholder="Ej: 010101"
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
            {isSubmitting ? "Guardando" : "Guardar Ubigeo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
