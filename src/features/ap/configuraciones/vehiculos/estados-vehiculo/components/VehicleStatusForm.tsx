import {
  VehicleStatusSchema,
  vehicleStatusSchemaCreate,
  vehicleStatusSchemaUpdate,
} from "../lib/vehicleStatus.schema";
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
import { FormSelect } from "@/shared/components/FormSelect";

interface VehicleStatusFormProps {
  defaultValues: Partial<VehicleStatusSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

const usoOptions = [
  {
    label: "Ventas",
    value: "VENTA",
  },
  {
    label: "Taller",
    value: "TALLER",
  },
];

export const VehicleStatusForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: VehicleStatusFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? vehicleStatusSchemaCreate : vehicleStatusSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cod.</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: AGN" {...field} />
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
                  <Input placeholder="Ej: Vehículo Nuevo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormSelect
            name="use"
            label="Categoría"
            placeholder="Selecciona su categoría"
            options={usoOptions}
            control={form.control}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-md border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: field.value || "#3b82f6" }}
                    />
                    <div className="flex-1">
                      <input
                        type="color"
                        value={field.value || "#3b82f6"}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-full h-10 rounded-md border border-gray-300 cursor-pointer bg-transparent"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          background: "transparent",
                          padding: "2px",
                        }}
                      />
                    </div>
                    <Input
                      value={field.value || "#3b82f6"}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="#000000"
                      className="w-24 h-10 text-xs font-mono"
                      maxLength={7}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Link to={mode === "create" ? "./" : "../"}>
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
            {isSubmitting ? "Guardando" : "Guardar Estado de Vehículo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
