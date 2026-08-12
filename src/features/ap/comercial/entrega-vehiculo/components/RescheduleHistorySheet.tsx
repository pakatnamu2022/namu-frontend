"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  History,
  ArrowRight,
  CalendarClock,
  User,
  MessageSquareText,
  ShieldAlert,
  Package,
} from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useVehicleDeliveryRescheduleHistory } from "../lib/vehicleDelivery.hook";
import { VehicleDeliveryRescheduleHistoryItem } from "../lib/vehicleDelivery.interface";

interface RescheduleHistorySheetProps {
  vehicleDeliveryId: number;
  vin?: string;
}

const formatDate = (value: string) => {
  try {
    return format(new Date(value), "dd MMM yyyy", { locale: es });
  } catch {
    return value;
  }
};

const formatTime = (value: string) => {
  try {
    return format(new Date(value), "HH:mm", { locale: es });
  } catch {
    return "";
  }
};

export default function RescheduleHistorySheet({
  vehicleDeliveryId,
  vin,
}: RescheduleHistorySheetProps) {
  const [open, setOpen] = useState(false);

  const { data: history = [], isLoading } = useVehicleDeliveryRescheduleHistory(
    vehicleDeliveryId,
    open,
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="size-7"
        tooltip="Historial de reprogramaciones"
        onClick={() => setOpen(true)}
      >
        <History className="size-4" />
      </Button>

      <GeneralSheet
        title="Historial de Reprogramaciones"
        subtitle={vin ? `Entrega de Vehículo - VIN: ${vin}` : undefined}
        open={open}
        onClose={() => setOpen(false)}
        icon="History"
        size="md"
        isLoading={isLoading}
      >
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
              <Package className="size-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">
              Esta entrega no ha sido reprogramada
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            {history.map((item: VehicleDeliveryRescheduleHistoryItem) => (
              <div
                key={item.id}
                className="rounded-xl bg-card shadow-sm p-3.5 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                      <CalendarClock className="size-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs min-w-0 flex-wrap">
                      <span className="text-muted-foreground line-through decoration-red-400">
                        {formatDate(item.previous_date)} ·{" "}
                        {formatTime(item.previous_date)}
                      </span>
                      <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-foreground">
                        {formatDate(item.new_date)} ·{" "}
                        {formatTime(item.new_date)}
                      </span>
                    </div>
                  </div>
                  {item.is_extraordinary ? (
                    <Badge color="amber" icon={ShieldAlert} className="shrink-0">
                      Extraordinaria
                    </Badge>
                  ) : (
                    <Badge color="gray" className="shrink-0">
                      Normal
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="size-7 rounded-lg bg-violet-100 dark:bg-violet-950/40 flex items-center justify-center shrink-0">
                    <User className="size-3.5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {item.rescheduled_by_name}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDate(item.created_at)} ·{" "}
                      {formatTime(item.created_at)}
                    </p>
                  </div>
                </div>

                {item.observations && (
                  <div className="flex items-start gap-2 text-xs">
                    <div className="size-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                      <MessageSquareText className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-muted-foreground pt-1.5 leading-snug">
                      {item.observations}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </GeneralSheet>
    </>
  );
}
