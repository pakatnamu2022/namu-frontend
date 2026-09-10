"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Loader2,
  Search,
  CornerDownLeft,
  PackageSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { errorToast, successToast } from "@/core/core.function";
import {
  useAllVehicles,
  useVehicleById,
} from "../../vehiculos/lib/vehicles.hook";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { useSwapVehiclePurchaseRequestQuote } from "../lib/purchaseRequestQuote.hook";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";
import { VehiclePickerList } from "./VehiclePickerList";

interface SwapVehicleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: PurchaseRequestQuoteResource;
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export default function SwapVehicleSheet({
  open,
  onOpenChange,
  quote,
}: SwapVehicleSheetProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const { data: currentVehicle, isLoading: isLoadingCurrent } = useVehicleById(
    quote.ap_vehicle_id ?? 0,
  );

  // El vehículo de reemplazo siempre debe ser de la misma familia de la
  // oportunidad de la solicitud. No hay opción para ver otras familias/modelos.
  const { data: vehicles = [], isLoading } = useAllVehicles({
    ap_vehicle_status_id: [2, 5],
    has_purchase_request_quote: 0,
    warehouse$sede_id: quote.sede_id,
    model$family_id: quote.opportunity_family_id,
  });

  const swapMutation = useSwapVehiclePurchaseRequestQuote();

  const filteredVehicles = useMemo(() => {
    const list = (vehicles as VehicleResource[]).filter(
      (v) => v.id !== quote.ap_vehicle_id,
    );
    const term = normalize(search.trim());
    if (!term) return list;
    return list.filter((v) =>
      normalize(
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
      ).includes(term),
    );
  }, [vehicles, search, quote.ap_vehicle_id]);

  const selectedVehicle =
    filteredVehicles.find((v) => v.id === selectedVehicleId) ?? null;
  const canQuickAssign = filteredVehicles.length === 1 && !!search.trim();

  const handleClose = () => {
    onOpenChange(false);
    setSelectedVehicleId(null);
    setSearch("");
  };

  const swap = async (vehicleId: number) => {
    try {
      await swapMutation.mutateAsync({
        id: quote.id,
        ap_vehicle_id: vehicleId,
      });
      successToast("Vehículo cambiado correctamente");
      handleClose();
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al cambiar el vehículo");
    }
  };

  const handleSwap = () => {
    if (!selectedVehicleId) {
      errorToast("Selecciona el vehículo nuevo");
      return;
    }
    swap(selectedVehicleId);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (canQuickAssign) swap(filteredVehicles[0].id);
    else if (filteredVehicles.length >= 1)
      setSelectedVehicleId(filteredVehicles[0].id);
  };

  return (
    <GeneralSheet
      open={open}
      onClose={handleClose}
      title="Cambiar vehículo"
      subtitle={`Solicitud ${quote.correlative} · ${quote.sede ?? ""}`}
      icon="ArrowLeftRight"
      size="2xl"
      childrenFooter={
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-xs text-muted-foreground">
            {selectedVehicle ? (
              <span className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">Nuevo:</span>
                <span className="truncate font-mono font-semibold">
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
              onClick={handleSwap}
              disabled={!selectedVehicleId || swapMutation.isPending}
            >
              {swapMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                "Confirmar cambio"
              )}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex h-full flex-col gap-3">
        {/* Vehículo actual */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Vehículo actual
          </p>
          <div className="rounded-xl border border-amber-400/70 bg-amber-50 px-3 py-2.5 dark:bg-amber-950/20">
            {isLoadingCurrent ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : currentVehicle ? (
              <div className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold tracking-wide">
                    {currentVehicle.vin}
                  </span>
                  {currentVehicle.model?.code && (
                    <Badge
                      variant="outline"
                      className="px-1.5 py-0 font-mono text-[10px]"
                    >
                      {currentVehicle.model.code}
                    </Badge>
                  )}
                </span>
                <span className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {[
                    currentVehicle.model?.version,
                    currentVehicle.year,
                    currentVehicle.vehicle_color,
                    currentVehicle.engine_type,
                    currentVehicle.warehouse_name,
                  ]
                    .filter(Boolean)
                    .join("  ·  ")}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No se pudo cargar el vehículo actual.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <ArrowDownUp className="h-4 w-4 shrink-0" />
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Buscar vehículo nuevo por VIN, modelo, color..."
            className="pl-9 pr-24"
          />
          {canQuickAssign && (
            <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              <CornerDownLeft className="h-3 w-3" />
              Enter para cambiar
            </span>
          )}
        </div>

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
                  : "No hay otros vehículos disponibles en esta sede"}
              </p>
            </div>
          ) : (
            <VehiclePickerList
              vehicles={filteredVehicles}
              selectedId={selectedVehicleId}
              onSelect={setSelectedVehicleId}
              onQuickPick={swap}
            />
          )}
        </div>
      </div>
    </GeneralSheet>
  );
}
