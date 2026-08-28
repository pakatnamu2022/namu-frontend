"use client";

import { format, startOfMonth, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarCheck2, Loader2, Save } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  title?: string;
  description?: string;
  emptyMessage?: string;
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDates: Date[];
  onSelectDates: (dates: Date[]) => void;
  onSave: () => void;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
  saveLabel?: string;
}

export default function MultiDateSelectorCard({
  title = "Calendario",
  description,
  emptyMessage = "Selecciona los filtros necesarios para ver y editar el calendario.",
  month,
  onMonthChange,
  selectedDates,
  onSelectDates,
  onSave,
  isLoading = false,
  isSaving = false,
  disabled = false,
  saveLabel = "Guardar",
}: Props) {
  const monthStart = startOfMonth(month);
  const today = startOfMonth(new Date());
  const isPastMonth = monthStart < today;

  const handleSelect = (dates: Date[] | undefined) => {
    if (isPastMonth) return;
    onSelectDates((dates ?? []).filter((d) => isSameMonth(d, month)));
  };

  if (disabled) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
          <CalendarCheck2 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && (
            <CardDescription>
              {description}{" "}
              <span className="font-medium capitalize">
                {format(month, "MMMM yyyy", { locale: es })}
              </span>
              .
            </CardDescription>
          )}
        </div>
        <Badge variant="outline" className="w-fit">
          {selectedDates.length} fecha(s) seleccionada(s)
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {isPastMonth && (
              <p className="w-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
                No se pueden modificar fechas de meses pasados. Solo puedes
                editar el mes actual o meses futuros.
              </p>
            )}
            <Calendar
              mode="multiple"
              month={month}
              onMonthChange={onMonthChange}
              selected={selectedDates}
              onSelect={handleSelect}
              disabled={isPastMonth ? () => true : { before: new Date(0) }}
              locale={es}
              className="rounded-md border"
            />
            <Button
              onClick={onSave}
              disabled={isSaving || isPastMonth}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveLabel}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
