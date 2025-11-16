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
      mode === "create" ? districtSchemaCreate : districtSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });
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
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distrito</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Namu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ubigeo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubigeo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 010101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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
            {isSubmitting ? "Guardando" : "Guardar Ubigeo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
