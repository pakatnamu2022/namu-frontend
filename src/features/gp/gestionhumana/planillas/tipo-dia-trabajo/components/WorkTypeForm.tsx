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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WorkTypeSchema,
  workTypeSchemaCreate,
  workTypeSchemaUpdate,
} from "../lib/work-type.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { WORK_TYPE } from "../lib/work-type.constant";
import { Textarea } from "@/components/ui/textarea";

interface WorkTypeFormProps {
  defaultValues: Partial<WorkTypeSchema>;
  onSubmit: (data: WorkTypeSchema) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
}

export const WorkTypeForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
}: WorkTypeFormProps) => {
  const { ABSOLUTE_ROUTE, MODEL } = WORK_TYPE;

  const form = useForm<WorkTypeSchema>({
    resolver: zodResolver(
      mode === "create" ? workTypeSchemaCreate : workTypeSchemaUpdate,
    ) as any,
    defaultValues: {
      code: defaultValues.code ?? "",
      name: defaultValues.name ?? "",
      description: defaultValues.description ?? "",
      multiplier: defaultValues.multiplier ?? 1,
      base_hours: defaultValues.base_hours ?? 12,
      is_extra_hours: defaultValues.is_extra_hours ?? false,
      is_night_shift: defaultValues.is_night_shift ?? false,
      is_holiday: defaultValues.is_holiday ?? false,
      is_sunday: defaultValues.is_sunday ?? false,
      active: defaultValues.active ?? true,
      order: defaultValues.order ?? 0,
      shift_type: defaultValues.shift_type ?? "MORNING",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <FormField
            control={form.control}
            name="shift_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Turno</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo de turno" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MORNING">
                      Turno Mañana (7:00 AM - 7:00 PM)
                    </SelectItem>
                    <SelectItem value="NIGHT">
                      Turno Noche (7:00 PM - 7:00 AM)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: TM, TN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Turno Mañana" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="base_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas Base</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Ej: 12"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Los turnos son de 12 horas</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2 xl:col-span-3">
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción del tipo de día de trabajo"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
