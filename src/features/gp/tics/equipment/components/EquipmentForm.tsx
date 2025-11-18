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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  EquipmentSchema,
  equipmentSchemaCreate,
  equipmentSchemaUpdate,
} from "../lib/equipment.schema";
import { EquipmentTypeResource } from "../../equipmentType/lib/equipmentType.interface";
import { FormSelect } from "@/shared/components/FormSelect";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { Link } from "react-router-dom";
import { EQUIPMENT } from "../lib/equipment.constants";

interface EquipmentFormProps {
  defaultValues: Partial<EquipmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  equipmentTypes?: EquipmentTypeResource[];
  sedes?: SedeResource[];
}

export const EquipmentForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  equipmentTypes = [],
  sedes = [],
}: EquipmentFormProps) => {
  const { ABSOLUTE_ROUTE } = EQUIPMENT;
  const form = useForm({
    resolver: zodResolver(
      mode === "create" ? equipmentSchemaCreate : equipmentSchemaUpdate
    ),
    defaultValues: {
      ...defaultValues,
      pertenece_sede: defaultValues?.pertenece_sede ?? false,
    },
    mode: "onChange",
  });

  const tipoEquipoId = form.watch("tipo_equipo_id");
  const tipoAdquisicion = form.watch("tipo_adquisicion");
  const marca = form.watch("marca") || "";
  const modelo = form.watch("modelo") || "";
  const serie = form.watch("serie") || "";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 w-full formlayout"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormItem>
            <FormLabel>Nombre del equipo</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Laptop HP ProBook"
                value={`${marca} ${modelo} ${serie}`}
                disabled
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Por el momento | No debe ir, solo se deja debido a que ya hay en la base este campo y no hay Marca y Modelo */}
          <FormItem>
            <FormLabel>Marca | Modelo</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Laptop HP ProBook"
                value={`${marca} ${modelo}`}
                disabled
              />
            </FormControl>
            <FormMessage />
          </FormItem>

          <FormSelect
            control={form.control}
            name="tipo_equipo_id"
            label="Tipo de equipo"
            placeholder="Selecciona el tipo"
            options={equipmentTypes.map((type) => ({
              label: type.name,
              value: type.id.toString(),
            }))}
          />

          <FormSelect
            control={form.control}
            name="sede_id"
            label="Sede"
            placeholder="Selecciona la sede"
            options={sedes.map((sede) => ({
              label: sede.description,
              value: sede.id.toString(),
            }))}
          />

          <FormField
            control={form.control}
            name="serie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Serie del equipo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: KAHET1538FHSG173" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: HP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: ProBook 450 G7" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormSelect
            control={form.control}
            name="estado_uso"
            label="Estado de uso"
            placeholder="Selecciona el estado"
            options={[
              { label: "Nuevo", value: "NUEVO" },
              { label: "Usado", value: "USADO" },
            ]}
          />
        </div>

        {[1, 3, 5, 6].includes(Number(tipoEquipoId)) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="almacenamiento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Almacenamiento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: HDD 480GB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RAM</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 8GB" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="procesador"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procesador</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: i3-10250U" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="detalle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detalle</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones, condición, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePickerFormField
            name="fecha_adquisicion"
            label="Fecha de adquisición"
            placeholder="Elige una fecha"
            control={form.control}
          />

          <FormSelect
            control={form.control}
            name="tipo_adquisicion"
            label="Tipo de adquisición"
            placeholder="Selecciona el tipo"
            options={[
              { label: "Contrato", value: "CONTRATO" },
              { label: "Compra", value: "COMPRA" },
            ]}
          />

          <FormField
            control={form.control}
            name="proveedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proveedor del contrato</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Proveedor S.A." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoAdquisicion === "CONTRATO" && (
            <>
              <FormField
                control={form.control}
                name="contrato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de contrato</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {tipoAdquisicion === "COMPRA" && (
            <>
              <FormField
                control={form.control}
                name="factura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Factura</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: FF01-64961" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <FormField
          control={form.control}
          name="pertenece_sede"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Pertenece a la sede</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {/* 
        <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}
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
            {isSubmitting ? "Guardando..." : "Guardar equipo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
