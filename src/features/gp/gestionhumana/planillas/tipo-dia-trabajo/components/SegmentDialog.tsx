"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Clock } from "lucide-react";
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
import {
  WorkTypeSegmentSchema,
  workTypeSegmentSchema,
} from "../lib/work-type.schema";
import { ShiftType } from "../lib/work-type.interface";
import { FormInputText } from "@/shared/components/FormInputText";

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
    resolver: zodResolver(workTypeSegmentSchema) as any,
    defaultValues: getDefaultValues(),
    mode: "onChange",
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
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const convertHourToDecimal = (hours: number, minutes: number): number => {
    return hours + minutes / 60;
  };

  const convertDecimalToHourMinute = (
    decimal: number,
  ): { hours: number; minutes: number } => {
    const hours = Math.floor(decimal);
    const minutes = Math.round((decimal - hours) * 60);
    return { hours, minutes };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg">
            {segment ? "Editar Segmento" : "Agregar Segmento"}
          </DialogTitle>
          <DialogDescription>
            Configure las propiedades del segmento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="segment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Tipo
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Tipo" />
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
                    <FormLabel className="text-xs font-semibold">
                      Multiplicador
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={10}
                        placeholder="1.0"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border bg-muted/30">
                <FormField
                  control={form.control}
                  name="start_hour"
                  render={({ field }) => {
                    const { hours: startHours, minutes: startMinutes } =
                      convertDecimalToHourMinute(field.value);
                    return (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Hora Inicio
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-1.5">
                          <div className="flex flex-col gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={23}
                              placeholder="HH"
                              className="h-10 text-center font-semibold"
                              value={startHours}
                              onChange={(e) => {
                                const newHours = parseInt(e.target.value) || 0;
                                field.onChange(
                                  convertHourToDecimal(newHours, startMinutes),
                                );
                              }}
                            />
                            <span className="text-[10px] text-muted-foreground text-center">
                              HH
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={59}
                              placeholder="MM"
                              className="h-10 text-center font-semibold"
                              value={startMinutes}
                              onChange={(e) => {
                                const newMinutes =
                                  parseInt(e.target.value) || 0;
                                field.onChange(
                                  convertHourToDecimal(startHours, newMinutes),
                                );
                              }}
                            />
                            <span className="text-[10px] text-muted-foreground text-center">
                              MM
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 p-1.5 bg-primary/10 rounded text-center">
                          <p className="text-xs font-semibold text-primary">
                            {formatHour(field.value)}
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="p-3 rounded-lg border bg-muted/30">
                <FormField
                  control={form.control}
                  name="end_hour"
                  render={({ field }) => {
                    const { hours: endHours, minutes: endMinutes } =
                      convertDecimalToHourMinute(field.value);
                    return (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Hora Fin
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-1.5">
                          <div className="flex flex-col gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={24}
                              placeholder="HH"
                              className="h-10 text-center font-semibold"
                              value={endHours}
                              onChange={(e) => {
                                const newHours = parseInt(e.target.value) || 0;
                                field.onChange(
                                  convertHourToDecimal(newHours, endMinutes),
                                );
                              }}
                            />
                            <span className="text-[10px] text-muted-foreground text-center">
                              HH
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Input
                              type="number"
                              min={0}
                              max={59}
                              placeholder="MM"
                              className="h-10 text-center font-semibold"
                              value={endMinutes}
                              onChange={(e) => {
                                const newMinutes =
                                  parseInt(e.target.value) || 0;
                                field.onChange(
                                  convertHourToDecimal(endHours, newMinutes),
                                );
                              }}
                            />
                            <span className="text-[10px] text-muted-foreground text-center">
                              MM
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 p-1.5 bg-primary/10 rounded text-center">
                          <p className="text-xs font-semibold text-primary">
                            {formatHour(field.value)}
                          </p>
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>

            <FormInputText
              control={form.control}
              name="description"
              label="Descripción"
              placeholder="Ej: Hora de almuerzo"
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9"
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
                className="h-9"
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
