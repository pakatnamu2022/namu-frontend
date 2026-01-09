import { MapPin, Package, Truck, User } from "lucide-react";
import { TravelControlResource } from "../lib/travelControl.interface";

interface TripInfoSectionProps {
  trip: TravelControlResource;
}

export function TripInfoSection({ trip }: TripInfoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Información del Viaje</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoItem
          icon={Truck}
          label="Placa"
          value={trip.plate || "Sin placa"}
        />
        <InfoItem
          icon={User}
          label="Conductor"
          value={trip.driver?.name || "Sin Conductor"}
        />
        <InfoItem
          icon={MapPin}
          label="Ruta"
          value={trip.route || "Sin Ruta"}
        />
        <InfoItem
          icon={Package}
          label="Cliente"
          value={trip.client || "Sin cliente"}
        />
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
