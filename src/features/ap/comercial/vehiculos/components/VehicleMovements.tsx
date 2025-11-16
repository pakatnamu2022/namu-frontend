"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { useState } from "react";
import { VehicleMovement } from "../lib/vehicles.interface";

interface Props {
  movements: VehicleMovement[];
  loading?: boolean;
}

// Utility functions

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Empty State Component
const EmptyState = () => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center space-y-2">
      <History className="size-10 mx-auto text-muted-foreground" />
      <h3 className="text-sm font-medium text-foreground/90">
        Sin movimientos
      </h3>
      <p className="text-xs text-muted-foreground">
        Aún no hay movimientos registrados
      </p>
    </div>
  </div>
);

// Timeline Item Component
const TimelineItem = ({
  movement,
  isLast,
}: {
  movement: VehicleMovement;
  isLast: boolean;
}) => {
  const statusColor = movement.status_color || "#94a3b8";

  return (
    <div className="relative flex gap-4 pb-6 items-start">
      {/* Indicator */}
      <div className="flex flex-col items-center pt-1">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: statusColor,
            boxShadow: "0 0 0 4px rgba(0,0,0,0.03)",
          }}
        />
        {!isLast && <div className="w-px h-full mt-2 bg-muted-foreground/20" />}
      </div>

      {/* Content */}
      <div className="flex-1 -mt-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="text-sm font-medium"
              style={{
                color: statusColor,
              }}
            >
              {movement.status}
            </div>
            <div className="text-xs text-muted-foreground">•</div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(movement.date)}
            </div>
          </div>
        </div>

        {movement.observation && (
          <div className="mt-2 text-sm text-muted-foreground bg-muted-foreground/5 rounded-md p-3">
            {movement.observation}
          </div>
        )}
      </div>
    </div>
  );
};

// Timeline List Component
const TimelineList = ({
  movements,
}: {
  movements: VehicleMovement[];
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Badge
        variant="secondary"
        className="bg-blue-100 text-blue-800 hover:bg-blue-200"
      >
        {movements.length}{" "}
        {movements.length === 1 ? "movimiento" : "movimientos"}
      </Badge>
    </div>

    <Separator />

    <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-2">
      {movements.map((movement, index) => (
        <TimelineItem
          key={movement.id}
          movement={movement}
          isLast={index === movements.length - 1}
        />
      ))}
    </div>
  </div>
);

// Main Component
export default function VehicleMovements({
  movements,
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="size-7"
          disabled={loading}
          tooltip="Ver Movimientos"
        >
          <History className={cn("size-4", { "animate-spin": loading })} />
        </Button>
      </SheetTrigger>
      <SheetContent className="!max-w-(--breakpoint-md) overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Historial de Movimientos
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-6">
          {movements.length > 0 ? (
            <TimelineList movements={movements} />
          ) : (
            <EmptyState />
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cerrar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
