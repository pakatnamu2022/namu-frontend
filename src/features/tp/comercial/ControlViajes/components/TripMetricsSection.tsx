import { Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import { TravelControlResource } from "../lib/travelControl.interface";

interface TripMetricsSectionProps {
  trip: TravelControlResource;
  showFuelInfo?: boolean;
}

export function TripMetricsSection({
  trip,
  showFuelInfo = false,
}: TripMetricsSectionProps) {
  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Métricas del Viaje</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            label="Km Inicial"
            value={trip.initialKm?.toString() || "-"}
            subtext="km"
          />
          <MetricCard
            label="Km Final"
            value={trip.finalKm?.toString() || "-"}
            subtext="km"
          />
          <MetricCard
            label="Total Km"
            value={trip.totalKm?.toString() || "-"}
            subtext="km"
          />
          <MetricCard
            label="Horas Totales"
            value={trip.totalHours?.toFixed(2) || "-"}
            subtext="horas"
          />
          {trip.tonnage && (
            <MetricCard
              label="Toneladas"
              value={trip.tonnage.toString()}
              subtext="ton"
            />
          )}
        </div>
      </div>

      {showFuelInfo && trip.fuelAmount && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold flex items-center gap-2">
            <Fuel className="h-4 w-4 text-blue-600" />
            Combustible Registrado
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Factor Km"
              value={`S/ ${trip.factorKm?.toFixed(2)}`}
              subtext="por km"
            />
            <MetricCard
              label="Galones"
              value={trip.fuelGallons?.toString() || "-"}
              subtext="galones"
            />
            <div className="col-span-2">
              <MetricCard
                label="Monto Total"
                value={`S/ ${trip.fuelAmount?.toFixed(2)}`}
                subtext="combustible"
                highlight
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg flex flex-col items-center justify-center text-center",
        highlight ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
      )}
    >
      <p
        className={cn(
          "text-xs font-medium mb-1",
          highlight ? "text-blue-100" : "text-gray-600"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-bold",
          highlight ? "text-white" : "text-gray-900"
        )}
      >
        {value}
      </p>
      {subtext && (
        <p
          className={cn(
            "text-xs mt-1",
            highlight ? "text-blue-100" : "text-gray-500"
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}
