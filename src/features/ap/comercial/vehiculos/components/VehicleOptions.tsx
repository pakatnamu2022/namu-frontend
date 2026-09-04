import { useBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { BrandsResource } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.interface";
import { useFamilies } from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import { FamiliesResource } from "@/features/ap/configuraciones/vehiculos/familias/lib/families.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { FilterMultiSelect } from "@/shared/components/FilterMultiSelect";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SearchableSelectAsync } from "@/shared/components/SearchableSelectAsync";
import SearchInput from "@/shared/components/SearchInput";
import { CM_COMERCIAL_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => {
  const y = (currentYear + 1 - i).toString();
  return { label: y, value: y };
});

interface VehicleOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  ap_vehicle_status_id: string[];
  set_ap_vehicle_status_id: (value: string[]) => void;
  sedes?: SedeResource[];
  sedeId?: string;
  setSedeId?: (value: string) => void;
  familyId?: string;
  setFamilyId?: (value: string) => void;
  brandId?: string;
  setBrandId?: (value: string) => void;
  year?: string;
  setYear?: (value: string) => void;
}

export default function VehicleOptions({
  search,
  setSearch,
  ap_vehicle_status_id,
  set_ap_vehicle_status_id,
  sedes = [],
  sedeId = "",
  setSedeId,
  familyId = "",
  setFamilyId,
  brandId = "",
  setBrandId,
  year = "",
  setYear,
}: VehicleOptionsProps) {
  return (
    <FilterWrapper>
      <SearchInput
        placeholder="Buscar por VIN, modelo..."
        value={search}
        onChange={setSearch}
      />

      {setSedeId && (
        <SearchableSelect
          value={sedeId}
          onChange={setSedeId}
          placeholder="Sede"
          options={sedes.map((sede) => ({
            label: sede.abreviatura,
            value: sede.id.toString(),
          }))}
        />
      )}

      {setBrandId && (
        <SearchableSelectAsync
          useQueryHook={useBrands}
          mapOptionFn={(brand: BrandsResource) => ({
            label: brand.description,
            value: brand.id.toString(),
            description: brand.code,
          })}
          placeholder="Marca"
          value={brandId}
          onChange={setBrandId}
          additionalParams={{ type_operation_id: CM_COMERCIAL_ID }}
        />
      )}

      {setFamilyId && (
        <SearchableSelectAsync
          useQueryHook={useFamilies}
          mapOptionFn={(family: FamiliesResource) => ({
            label: family.description,
            value: family.id.toString(),
            description: family.code,
          })}
          placeholder="Familia"
          value={familyId}
          onChange={setFamilyId}
        />
      )}

      {setYear && (
        <SearchableSelect
          value={year}
          onChange={setYear}
          placeholder="Año"
          options={YEAR_OPTIONS}
        />
      )}

      <FilterMultiSelect
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
          { label: "VEHICULO FACTURADO FINAL", value: "9" },
        ]}
      />
    </FilterWrapper>
  );
}
