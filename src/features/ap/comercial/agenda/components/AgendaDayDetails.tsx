"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import AgendaActionCard from "./AgendaActionCard";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { AgendaDateGroup } from "../../oportunidades/lib/opportunities.interface";

interface AgendaDayDetailsProps {
  selectedDayData?: AgendaDateGroup;
}

export default function AgendaDayDetails({
  selectedDayData,
}: AgendaDayDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-lg font-semibold text-primary dark:text-primary-foreground">
          {selectedDayData
            ? `Acciones del ${format(
                parse(selectedDayData.date, "yyyy-MM-dd", new Date()),
                "PPP",
                {
                  locale: es,
                },
              )}`
            : "Selecciona un día"}
        </p>
      </div>
      <div>
        {selectedDayData && (
          <div className="flex gap-2">
            <Badge variant="outline" color="blue">
              <CheckCircle2 className="size-3 mr-1" />
              {selectedDayData.count_positive_result || 0} Exitosas
            </Badge>
            <Badge variant="outline" color="red">
              <Circle className="size-3 mr-1" />
              {selectedDayData.count_negative_result || 0} Sin resultado
            </Badge>
          </div>
        )}
      </div>
      <div>
        {!selectedDayData ? (
          <div className="text-center py-8 text-muted-foreground">
            Selecciona un día del calendario
          </div>
        ) : selectedDayData.actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay acciones programadas
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {selectedDayData.actions
                .sort(
                  (a: any, b: any) =>
                    new Date(a.datetime).getTime() -
                    new Date(b.datetime).getTime(),
                )
                .map((action: any) => (
                  <div key={action.id} className="relative">
                    <AgendaActionCard action={action} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
