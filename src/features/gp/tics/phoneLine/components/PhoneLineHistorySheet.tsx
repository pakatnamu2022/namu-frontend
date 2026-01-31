"use client";

import GeneralSheet from "@/shared/components/GeneralSheet";
import { usePhoneLineHistory } from "../lib/phoneLine.hook";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Loader2, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface PhoneLineHistorySheetProps {
  open: boolean;
  phoneLineId: number | null;
  onClose: () => void;
}

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

export default function PhoneLineHistorySheet({
  open,
  phoneLineId,
  onClose,
}: PhoneLineHistorySheetProps) {
  const { data, isFetching } = usePhoneLineHistory(open ? phoneLineId : null);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      icon="History"
      title="Historial de Asignaciones"
      subtitle="Registro de todas las asignaciones realizadas a esta línea telefónica"
      size="xl"
    >
      {isFetching ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          No hay asignaciones registradas.
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3">
            {data.map((item) => {
              const isActive = !item.unassigned_at;
              return (
                <div
                  key={item.id}
                  className="rounded-lg border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {item.worker_name}
                      </span>
                    </div>
                    <Badge
                      color={isActive ? "green" : "red"}
                      variant="outline"
                    >
                      {isActive ? "Activo" : "Desasignado"}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Asignado
                        </p>
                        <p className="font-medium">
                          {formatDate(item.assigned_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="size-3.5 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground text-xs">
                          Desasignado
                        </p>
                        <p className="font-medium">
                          {item.unassigned_at
                            ? formatDate(item.unassigned_at)
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </GeneralSheet>
  );
}
