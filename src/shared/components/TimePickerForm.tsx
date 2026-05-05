"use client";

import * as React from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface TimePickerFormProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
}

export function TimePickerForm<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Selecciona hora",
  description,
  disabled = false,
}: TimePickerFormProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [isOpen, setIsOpen] = React.useState(false);

  // field.value is expected to be "HH:mm"
  const parseTime = (value: string) => {
    const [h, m] = (value || "").split(":").map(Number);
    return { hours: isNaN(h) ? null : h, minutes: isNaN(m) ? null : m };
  };

  const { hours: currentHours, minutes: currentMinutes } = parseTime(
    field.value,
  );

  const formatDisplay = () => {
    if (currentHours === null || currentMinutes === null) return null;
    const h12 = currentHours % 12 || 12;
    const ampm = currentHours >= 12 ? "PM" : "AM";
    return `${h12.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")} ${ampm}`;
  };

  const updateTime = (hours: number, minutes: number) => {
    field.onChange(
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
    );
  };

  const handleHourChange = (hour: number) => {
    const isPM = (currentHours ?? 0) >= 12;
    let newHour = hour === 12 ? 0 : hour;
    if (isPM) newHour += 12;
    updateTime(newHour, currentMinutes ?? 0);
  };

  const handleMinuteChange = (minute: number) => {
    updateTime(currentHours ?? 0, minute);
  };

  const handleAmPmChange = (ampm: "AM" | "PM") => {
    const h = currentHours ?? 0;
    if (ampm === "PM" && h < 12) updateTime(h + 12, currentMinutes ?? 0);
    else if (ampm === "AM" && h >= 12) updateTime(h - 12, currentMinutes ?? 0);
  };

  const hour12List = Array.from({ length: 12 }, (_, i) => i + 1).reverse();
  const minuteList = Array.from({ length: 60 }, (_, i) => i);

  const displayValue = formatDisplay();
  const hour12Current = currentHours !== null ? currentHours % 12 || 12 : null;

  return (
    <FormItem className="flex flex-col flex-1">
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
                !displayValue && "text-muted-foreground",
              )}
            >
              <ClockIcon className="mr-2 h-4 w-4" />
              {displayValue ?? <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="flex flex-col sm:flex-row sm:h-[220px] divide-y sm:divide-y-0 sm:divide-x">
              {/* Hours */}
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {hour12List.map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={hour12Current === hour ? "default" : "ghost"}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleHourChange(hour)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              {/* Minutes */}
              <ScrollArea className="w-64 sm:w-auto">
                <div className="flex sm:flex-col p-2">
                  {minuteList.map((minute) => (
                    <Button
                      key={minute}
                      size="icon"
                      variant={
                        currentMinutes === minute ? "default" : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleMinuteChange(minute)}
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="sm:hidden" />
              </ScrollArea>

              {/* AM/PM */}
              <ScrollArea>
                <div className="flex sm:flex-col p-2">
                  {(["AM", "PM"] as const).map((ampm) => (
                    <Button
                      key={ampm}
                      size="icon"
                      variant={
                        currentHours !== null &&
                        ((ampm === "AM" && currentHours < 12) ||
                          (ampm === "PM" && currentHours >= 12))
                          ? "default"
                          : "ghost"
                      }
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleAmPmChange(ampm)}
                    >
                      {ampm}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage>{error?.message}</FormMessage>
    </FormItem>
  );
}
