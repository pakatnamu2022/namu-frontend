"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { Button } from "@/components/ui/button";
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
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormInput } from "@/shared/components/FormInput";

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
      mode === "create" ? equipmentSchemaCreate : equipmentSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
      pertenece_sede: defaultValues?.pertenece_sede ?? false,
      compartido: defaultValues?.compartido ?? false,
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="nombre_equipo"
            label="Nombre del equipo"
            placeholder="Ej: Laptop HP ProBook"
            value={`${marca} ${modelo} ${serie}`}
            disabled
          />

          {/* Por el momento | No debe ir, solo se deja debido a que ya hay en la base este campo y no hay Marca y Modelo */}
          <FormInput
            name="marca_modelo"
            label="Marca | Modelo"
            placeholder="Ej: Laptop HP ProBook"
            value={`${marca} ${modelo}`}
            disabled
          />

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

          <FormInput
            control={form.control}
            name="serie"
            label="Serie del equipo"
            placeholder="Ej: KAHET1538FHSG173"
          />

          <FormInput
            control={form.control}
            name="marca"
            label="Marca"
            placeholder="Ej: HP"
          />

          <FormInput
            control={form.control}
            name="modelo"
            label="Modelo"
            placeholder="Ej: ProBook 450 G7"
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
            <FormInput
              control={form.control}
              name="almacenamiento"
              label="Almacenamiento"
              placeholder="Ej: HDD 480GB"
            />
            <FormInput
              control={form.control}
              name="ram"
              label="RAM"
              placeholder="Ej: 8GB"
            />
            <FormInput
              control={form.control}
              name="procesador"
              label="Procesador"
              placeholder="Ej: i3-10250U"
            />
          </div>
        )}

        <FormTextArea
          control={form.control}
          name="detalle"
          label="Detalle"
          placeholder="Observaciones, condición, etc."
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

          <FormInput
            control={form.control}
            name="proveedor"
            label="Proveedor del contrato"
            placeholder="Ej: Proveedor S.A."
            type="text"
          />

          {tipoAdquisicion === "CONTRATO" && (
            <FormInput
              control={form.control}
              name="contrato"
              label="Número de contrato"
              placeholder="Ej: 12345"
              type="text"
            />
          )}

          {tipoAdquisicion === "COMPRA" && (
            <FormInput
              control={form.control}
              name="factura"
              label="Número de Factura"
              placeholder="Ej: FF01-64961"
              type="text"
            />
          )}

          <FormSwitch
            control={form.control}
            name="pertenece_sede"
            label="Pertenencia a sede"
            text="¿El equipo pertenece a la sede seleccionada?"
          />

          <FormSwitch
            control={form.control}
            name="compartido"
            label="Equipo compartido"
            text="¿El equipo puede asignarse a más de una persona al mismo tiempo?"
          />
        </div>

        {/* <pre>
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
