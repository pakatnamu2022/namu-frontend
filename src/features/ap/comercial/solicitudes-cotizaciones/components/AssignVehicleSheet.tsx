"use client";

import { useMemo, useState } from "react";
import {
  Car,
  Loader2,
  Search,
  CornerDownLeft,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useAllVehicles } from "../../vehiculos/lib/vehicles.hook";
import { useAssignVehicleToPurchaseRequestQuote } from "../lib/purchaseRequestQuote.hook";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { VehiclePickerList } from "./VehiclePickerList";
import { errorToast, successToast } from "@/core/core.function";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";

interface AssignVehicleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function AssignVehicleSheet({
  open,
  onOpenChange,
  quote,
}: AssignVehicleSheetProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  );
  const [search, setSearch] = useState("");

  // Siempre se asignan vehículos de la misma familia de la oportunidad de la
  // solicitud. No hay opción para ver otras familias/modelos.
  const { data: vehicles = [], isLoading } = useAllVehicles({
    ap_vehicle_status_id: [2, 5],
    has_purchase_request_quote: 0,
    warehouse$sede_id: quote.sede_id,
    model$family_id: quote.opportunity_family_id,
  });

  const assignVehicleMutation = useAssignVehicleToPurchaseRequestQuote();

  const filteredVehicles = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return vehicles as VehicleResource[];
    return (vehicles as VehicleResource[]).filter((v) => {
      const haystack = normalize(
        [
          v.vin,
          v.model?.version,
          v.model?.code,
          v.vehicle_color,
          v.engine_type,
          v.warehouse_name,
          String(v.year ?? ""),
        ]
          .filter(Boolean)
          .join(" "),
      );
      return haystack.includes(term);
    });
  }, [vehicles, search]);

  const selectedVehicle =
    (vehicles as VehicleResource[]).find((v) => v.id === selectedVehicleId) ??
    null;

  const canQuickAssign = filteredVehicles.length === 1 && !!search.trim();

  const handleClose = () => {
    onOpenChange(false);
    setSelectedVehicleId(null);
    setSearch("");
  };

  const assign = async (vehicleId: number) => {
    try {
      await assignVehicleMutation.mutateAsync({
        id: quote.id,
        ap_vehicle_id: vehicleId,
      });
      successToast("Vehículo asignado correctamente");
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al asignar el vehículo");
    }
  };

  const handleAssign = () => {
    if (!selectedVehicleId) {
      errorToast("Selecciona un vehículo");
      return;
    }
    assign(selectedVehicleId);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (canQuickAssign) {
      assign(filteredVehicles[0].id);
    } else if (filteredVehicles.length >= 1) {
      setSelectedVehicleId(filteredVehicles[0].id);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Asignar vehículo"
      subtitle={`Solicitud ${quote.correlative} · ${quote.sede ?? ""}`}
      icon="Car"
      size="2xl"
      childrenFooter={
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-xs text-muted-foreground">
            {selectedVehicle ? (
              <span className="flex items-center gap-1.5">
                <span className="text-foreground font-medium">
                  Seleccionado:
                </span>
                <span className="font-mono font-semibold truncate">
                  {selectedVehicle.vin}
                </span>
              </span>
            ) : (
              "Ningún vehículo seleccionado"
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedVehicleId || assignVehicleMutation.isPending}
            >
              {assignVehicleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Asignando...
                </>
              ) : (
                "Asignar vehículo"
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar por VIN, modelo, color, almacén..."
            className="pl-9 pr-24"
          />
          {canQuickAssign && (
            <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              <CornerDownLeft className="h-3 w-3" />
              Enter para asignar
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between gap-3">
          <Badge className="font-normal">
            {isLoading
              ? "Cargando..."
              : `${filteredVehicles.length} disponible${
                  filteredVehicles.length === 1 ? "" : "s"
                }`}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Familia: {quote.opportunity_family ?? "—"}
          </span>
        </div>

        {/* List */}
        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <PackageSearch className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {search.trim()
                  ? "Ningún vehículo coincide con la búsqueda"
                  : "No hay vehículos disponibles en esta sede"}
              </p>
            </div>
          ) : (
            <VehiclePickerList
              vehicles={filteredVehicles}
              selectedId={selectedVehicleId}
              onSelect={setSelectedVehicleId}
              onQuickPick={assign}
            />
          )}
        </div>

        {filteredVehicles.length > 0 && !isLoading && (
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
            <Car className="h-3 w-3" />
            Doble clic sobre un vehículo para asignarlo al instante.
          </p>
        )}
      </div>
    </GeneralSheet>
  );
}
