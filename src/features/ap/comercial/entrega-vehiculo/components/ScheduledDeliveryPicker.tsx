"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Control, FieldValues, Path, useController } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Clock, Loader } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Matcher } from "react-day-picker";
import { useAvailableDeliverySlots } from "../lib/vehicleDelivery.hook";

interface ScheduledDeliveryPickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  minDate?: Date;
  autoSelectFirstAvailable?: boolean;
}

const buildDateTimeString = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export function ScheduledDeliveryPicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Selecciona fecha y hora",
  description,
  disabled = false,
  minDate,
  autoSelectFirstAvailable = false,
}: ScheduledDeliveryPickerProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [isOpen, setIsOpen] = React.useState(false);

  const selectedDate = field.value ? new Date(field.value) : undefined;
  const selectedTime = selectedDate
    ? `${String(selectedDate.getHours()).padStart(2, "0")}:${String(
        selectedDate.getMinutes(),
      ).padStart(2, "0")}`
    : undefined;

  const [calendarDay, setCalendarDay] = React.useState<Date | undefined>(
    selectedDate,
  );

  React.useEffect(() => {
    if (selectedDate) setCalendarDay(selectedDate);
  }, [field.value]);

  React.useEffect(() => {
    if (!autoSelectFirstAvailable || field.value || calendarDay) return;
    setCalendarDay(
      minDate ??
        (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          return tomorrow;
        })(),
    );
  }, [autoSelectFirstAvailable]);

  const calendarDayStr = calendarDay
    ? format(calendarDay, "yyyy-MM-dd")
    : undefined;

  const { data: slotsResponse, isFetching: isLoadingSlots } =
    useAvailableDeliverySlots(calendarDayStr);

  const daySlots = slotsResponse?.slots ?? [];

  React.useEffect(() => {
    if (!autoSelectFirstAvailable || field.value || !calendarDay) return;
    if (isLoadingSlots) return;
    const firstAvailable = daySlots.find((slot) => slot.available);
    if (firstAvailable) {
      field.onChange(buildDateTimeString(calendarDay, firstAvailable.time));
    }
  }, [autoSelectFirstAvailable, calendarDay, isLoadingSlots, daySlots]);

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    setCalendarDay(day);
  };

  const handleSlotSelect = (time: string) => {
    if (!calendarDay) return;
    field.onChange(buildDateTimeString(calendarDay, time));
    setIsOpen(false);
  };

  const buildDisabledMatcher = (): Matcher | Matcher[] | undefined => {
    const matchers: Matcher[] = [{ dayOfWeek: [0] }];
    if (minDate) matchers.push({ before: minDate });
    return matchers;
  };

  return (
    <FormItem className="flex flex-col justify-between">
      {label && (
        <FormLabel className="flex justify-start items-center text-xs md:text-sm mb-1 leading-none dark:text-muted-foreground">
          {label}
        </FormLabel>
      )}
      <FormControl>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "dd/MM/yyyy hh:mm aa", { locale: es })
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="sm:flex">
              <Calendar
                mode="single"
                selected={calendarDay}
                onSelect={handleDaySelect}
                disabled={buildDisabledMatcher()}
                autoFocus
                locale={es}
              />
              <div className="flex flex-col sm:w-40 sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x border-t sm:border-t-0">
                <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Horarios
                </div>
                <ScrollArea className="flex-1">
                  <div className="flex flex-col gap-1 p-2">
                    {!calendarDay ? (
                      <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                        Selecciona un día
                      </p>
                    ) : isLoadingSlots ? (
                      <div className="flex items-center justify-center gap-2 px-2 py-4 text-xs text-muted-foreground">
                        <Loader className="h-3.5 w-3.5 animate-spin" />
                        Cargando…
                      </div>
                    ) : daySlots.length === 0 ? (
                      <p className="text-xs text-muted-foreground px-2 py-4 text-center">
                        Sin horarios disponibles
                      </p>
                    ) : (
                      daySlots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        return (
                          <Button
                            key={slot.time}
                            type="button"
                            size="sm"
                            variant={isSelected ? "default" : "ghost"}
                            disabled={!slot.available}
                            className="justify-center"
                            onClick={() => handleSlotSelect(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage>{error?.message}</FormMessage>
    </FormItem>
  );
}
