import { FilterCombobox } from "@/shared/components/FilterCombobox";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";

interface VehicleOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  ap_vehicle_status_id: string[];
  set_ap_vehicle_status_id: (value: string[]) => void;
}

export default function VehicleOptions({
  search,
  setSearch,
  ap_vehicle_status_id,
  set_ap_vehicle_status_id,
}: VehicleOptionsProps) {
  return (
    <FilterWrapper>
      <SearchInput
        placeholder="Buscar por VIN, modelo..."
        value={search}
        onChange={setSearch}
      />
      <FilterCombobox
        placeholder="Estado Vehículo"
        value={ap_vehicle_status_id}
        onChange={set_ap_vehicle_status_id}
        options={[
          { label: "PEDIDO VN", value: "1" },
          { label: "VEHICULO EN TRANSITO", value: "2" },
          { label: "VEHICULO EN TRANSITO DEVUELTO", value: "3" },
          { label: "VEHICULO VENDIDO NO ENTREGADO", value: "4" },
          { label: "INVENTARIO VN", value: "5" },
          { label: "VEHICULO VENDIDO ENTREGADO", value: "6" },
          { label: "VEHICULO FACTURADO", value: "7" },
          { label: "VEHICULO EN CONSIGNACION", value: "8" },
        ]}
      />
    </FilterWrapper>
  );
}
