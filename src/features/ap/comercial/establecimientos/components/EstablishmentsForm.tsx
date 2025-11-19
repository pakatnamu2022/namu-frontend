"use client";

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
import { Button } from "@/components/ui/button";
import { Building2, Loader, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  EstablishmentsSchema,
  establishmentsSchema,
} from "../lib/establishments.schema";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { FormSelect } from "@/shared/components/FormSelect";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import {
  useAllDepartment,
  useAllProvince,
  useAllDistrict,
} from "@/features/gp/gestionsistema/ubicaciones/lib/location.hook";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ESTABLISHMENTS,
  SUPPLIER_ESTABLISHMENTS,
} from "../lib/establishments.constants";

const AUTOMOTORES_PAKATNAMU_ID = 17;

interface EstablishmentsFormProps {
  defaultValues: Partial<EstablishmentsSchema>;
  onSubmit: (data: EstablishmentsSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  businessPartnerId: number;
  isCustomer: boolean;
}

export const EstablishmentsForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  businessPartnerId,
  isCustomer,
}: EstablishmentsFormProps) => {
  const { ABSOLUTE_ROUTE } = ESTABLISHMENTS;
  const { ABSOLUTE_ROUTE: SUPPLIER_ABSOLUTE_ROUTE } = SUPPLIER_ESTABLISHMENTS;
  const form = useForm<EstablishmentsSchema>({
    resolver: zodResolver(establishmentsSchema),
    defaultValues: {
      ...defaultValues,
      business_partner_id: businessPartnerId,
      // Si viene sede_id en defaultValues (modo editar), marcar el checkbox
      vincular_sede: !!defaultValues.sede_id,
    },
  });

  const selectedDepartmentId = form.watch("department_id");
  const selectedProvinceId = form.watch("province_id");
  const vincularSede = form.watch("vincular_sede");
  const isAutomotoresPakatnamu = businessPartnerId === AUTOMOTORES_PAKATNAMU_ID;

  const { data: departments = [], isLoading: isLoadingDepartments } =
    useAllDepartment();

  const { data: provinces = [], isLoading: isLoadingProvinces } =
    useAllProvince({
      department_id: selectedDepartmentId,
    });

  const { data: districts = [], isLoading: isLoadingDistricts } =
    useAllDistrict({
      province_id: selectedProvinceId,
    });

  const { data: sedes = [], isLoading: isLoadingSedes } = useAllSedes({
    empresa_id: EMPRESA_AP.id,
  });

  useEffect(() => {
    if (mode === "create" && selectedDepartmentId) {
      form.setValue("province_id", "");
      form.setValue("district_id", "");
    } else if (selectedDepartmentId !== defaultValues.department_id) {
      form.setValue("province_id", "");
      form.setValue("district_id", "");
    }
  }, [selectedDepartmentId, form, mode]);

  useEffect(() => {
    if (mode === "create" && selectedProvinceId) {
      form.setValue("district_id", "");
    }
  }, [selectedProvinceId, form, mode]);

  // Limpiar sede_id cuando se desmarca el checkbox (solo en modo crear o si no había valor inicial)
  useEffect(() => {
    if (!vincularSede && mode === "create") {
      form.setValue("sede_id", "");
    } else if (!vincularSede && mode === "update" && !defaultValues.sede_id) {
      form.setValue("sede_id", "");
    }
  }, [vincularSede, form, mode, defaultValues.sede_id]);

  useEffect(() => {
    if (!vincularSede) {
      form.setValue("sede_id", "");
    }
  }, [vincularSede, form]);

  const handleFormSubmit = (data: EstablishmentsSchema) => {
    onSubmit(data);
  };

  if (isLoadingDepartments || isLoadingSedes) {
    return <FormSkeleton />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Información Básica */}
        <GroupFormSection
          icon={Building2}
          title="Información del Establecimiento"
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: 001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Sede Leguia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Comercial" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="activity_economic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actividad Económica</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingrese la actividad económica"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </GroupFormSection>

        {/* Ubicación */}
        <GroupFormSection
          icon={MapPin}
          title="Ubicación"
          cols={{ sm: 1, md: 2 }}
        >
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección *</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese la dirección" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

          {/* Checkbox para vincular sede - Solo para Automotores Pakatnamu */}
          {isAutomotoresPakatnamu && (
            <FormField
              control={form.control}
              name="vincular_sede"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Vincular con sede de Automotores Pakatnamu
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Asocia este establecimiento con una de nuestras sedes
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          {/* Select de Sede - Solo si está marcado el checkbox */}
          {isAutomotoresPakatnamu && vincularSede && (
            <FormSelect
              name="sede_id"
              label="Sede"
              placeholder="Selecciona una Sede"
              options={sedes.map((item) => ({
                label: item.abreviatura,
                value: item.id.toString(),
              }))}
              control={form.control}
              strictFilter={true}
            />
          )}
        </GroupFormSection>

        {/* Buttons */}
        <div className="flex gap-4 w-full justify-end">
          <Link
            to={`${
              isCustomer ? ABSOLUTE_ROUTE : SUPPLIER_ABSOLUTE_ROUTE
            }/${businessPartnerId}`}
          >
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
            {isSubmitting ? "Guardando" : "Guardar Establecimiento"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
