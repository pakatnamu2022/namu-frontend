import { useForm } from "react-hook-form";
import {
  VehicleAssignmentSchema,
  vehicleAssignmentSchemaCreate,
  vehicleAssignmentSchemaUpdate,
} from "../lib/vehicleAssignment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

import { FormSelect } from "@/shared/components/FormSelect";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDriverAssignmentSearch } from "../lib/vehicleAssignment.hook";
import { DriverSearchParams } from "../lib/vehicleAssignment.actions";

interface DriverResource {
  id: string;
  nombre_completo: string;
}

interface TractoResource {
  id: string;
  placa: string;
}

interface VehicleAssignmentFormProps {
  defaultValues?: Partial<VehicleAssignmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  drivers?: DriverResource[];
  tractors?: TractoResource[];
}

export const VehicleAssignmentForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  drivers = [],
  tractors = [],
}: VehicleAssignmentFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? vehicleAssignmentSchemaCreate
        : vehicleAssignmentSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  const [driverOptions, setDriverOptions] = useState(
    drivers.map((driver) => ({
      label: driver.nombre_completo,
      value: driver.id,
    })),
  );

  const [searchParams, setSearchParams] = useState<
    DriverSearchParams | undefined
  >(undefined);
  const { data: searchResults, isLoading: isSearching } =
    useDriverAssignmentSearch(searchParams);

    
  const searchTimeoutRef = useRef<number | null>(null);

  const handleSearch = (searchTerm: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim()) {
      setDriverOptions(
        drivers.map((driver) => ({
          label: driver.nombre_completo,
          value: driver.id,
        })),
      );
      setSearchParams(undefined);
      return;
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchParams({ search: searchTerm, limit: 30 });
    }, 300);
  };
  useEffect(() => {
    if (searchResults?.data) {
      const newOptions = searchResults.data.map((driver) => ({
        label: driver.nombre_completo,
        value: driver.id,
      }));
      setDriverOptions(newOptions);
    }
  }, [searchResults]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="driver"
            label="Conductor"
            placeholder="Seleccione un conductor"
            options={driverOptions}
            isSearchable={true}
            setSearchQuery={handleSearch}
            isLoadingOptions={isSearching}
          />

          <FormSelect
            control={form.control}
            name="vehicle"
            label="Vehiculo"
            placeholder="Seleccione un Vehiculo"
            options={tractors.map((tracto) => ({
              label: tracto.placa,
              value: tracto.id,
            }))}
          />
        </div>

        <div className="flex gap-4 w-full justify-end pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Descartar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
