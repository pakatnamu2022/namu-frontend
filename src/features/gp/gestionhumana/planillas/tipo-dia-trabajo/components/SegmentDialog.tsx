"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Textarea } from "@/components/ui/textarea";
import { WorkTypeSegmentSchema, workTypeSegmentSchema } from "../lib/work-type.schema";
import { ShiftType } from "../lib/work-type.interface";

interface SegmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  segment: WorkTypeSegmentSchema | null;
  onSave: (segment: WorkTypeSegmentSchema) => void;
  shiftType: ShiftType;
}

export const SegmentDialog = ({
  open,
  onOpenChange,
  segment,
  onSave,
  shiftType,
}: SegmentDialogProps) => {
  const getDefaultValues = (): WorkTypeSegmentSchema => {
    if (segment) {
      return segment;
    }
    return {
      segment_type: "WORK",
      segment_order: 1,
      start_hour: shiftType === "MORNING" ? 7 : 19,
      end_hour: shiftType === "MORNING" ? 8 : 20,
      duration_hours: 1,
      multiplier: 1,
      description: "",
    };
  };

  const form = useForm<WorkTypeSegmentSchema>({
    resolver: zodResolver(workTypeSegmentSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when dialog opens or segment changes
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues());
    }
  }, [open, segment]);

  const handleSubmit = (data: WorkTypeSegmentSchema) => {
    const duration = data.end_hour - data.start_hour;
    const segmentData = {
      ...data,
      duration_hours: duration > 0 ? duration : duration + 24,
    };

    onSave(segmentData);
    onOpenChange(false);
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {segment ? "Editar Segmento" : "Agregar Segmento"}
          </DialogTitle>
          <DialogDescription>
            Configure las propiedades del segmento de tiempo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit(handleSubmit)(e);
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="segment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="WORK">Trabajo</SelectItem>
                        <SelectItem value="BREAK">Descanso</SelectItem>
                      </SelectContent>
                    </Select>
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
                        max={10}
                        placeholder="1.0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Inicio</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={23}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatHour(field.value)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_hour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fin</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={24}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatHour(field.value)}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ej: Hora de almuerzo, horas extras, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit(handleSubmit)();
                }}
              >
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
