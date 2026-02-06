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
import { Switch } from "@/components/ui/switch";
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
  WorkTypeSegmentSchema,
} from "../lib/work-type.schema";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { WORK_TYPE } from "../lib/work-type.constant";
import { Textarea } from "@/components/ui/textarea";
import { TimelineSegmentEditor } from "./TimelineSegmentEditor";
import { ShiftType } from "../lib/work-type.interface";
import { useEffect } from "react";

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
      segments: defaultValues.segments ?? [],
    },
    mode: "onChange",
  });

  const shiftType = form.watch("shift_type") as ShiftType;
  const segments = form.watch("segments") as WorkTypeSegmentSchema[];

  // Reset segments when shift type changes
  useEffect(() => {
    if (shiftType) {
      form.setValue("segments", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shiftType]);

  const handleSegmentsChange = (newSegments: WorkTypeSegmentSchema[]) => {
    form.setValue("segments", newSegments, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 gap-y-6">
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
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="multiplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Multiplicador</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="Ej: 1.5"
                    {...field}
                  />
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
        </div>

        {/* Timeline Segment Editor */}
        {shiftType && (
          <div className="pt-6">
            <TimelineSegmentEditor
              shiftType={shiftType}
              segments={segments}
              onChange={handleSegmentsChange}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 gap-y-6 pt-4">
          <FormField
            control={form.control}
            name="is_extra_hours"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Horas Extra</FormLabel>
                  <FormDescription>Aplica para horas extras</FormDescription>
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

          <FormField
            control={form.control}
            name="is_night_shift"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Turno Nocturno</FormLabel>
                  <FormDescription>Aplica para turno nocturno</FormDescription>
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

          <FormField
            control={form.control}
            name="is_holiday"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Feriado</FormLabel>
                  <FormDescription>Aplica para días feriados</FormDescription>
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

          <FormField
            control={form.control}
            name="is_sunday"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Domingo</FormLabel>
                  <FormDescription>Aplica para días domingo</FormDescription>
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

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Activo</FormLabel>
                  <FormDescription>Estado del tipo de día</FormDescription>
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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
