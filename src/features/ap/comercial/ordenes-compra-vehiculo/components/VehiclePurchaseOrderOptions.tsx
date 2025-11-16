import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import ResponsiveFilters from "@/shared/components/ResponsiveFilters";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { useAllVehicleStatus } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.hook";
import { EMPRESA_AP } from "@/core/core.constants";
import { Option } from "@/core/core.interface";
import { useMemo } from "react";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedeId?: string;
  setSedeId: (value: string) => void;
  warehouseId?: string;
  setWarehouseId: (value: string) => void;
  supplierId?: string;
  setSupplierId: (value: string) => void;
  year?: string;
  setYear: (value: string) => void;
  modelId?: string;
  setModelId: (value: string) => void;
  colorId?: string;
  setColorId: (value: string) => void;
  statusId?: string;
  setStatusId: (value: string) => void;
}

export default function VehiclePurchaseOrderOptions({
  search,
  setSearch,
  sedeId = "all",
  setSedeId,
  modelId = "all",
  setModelId,
  statusId = "all",
  setStatusId,
}: Props) {
  const { data: sedes = [] } = useAllSedes({ empresa_id: EMPRESA_AP.id });
  const { data: models = [] } = useAllModelsVn();
  const { data: statuses = [] } = useAllVehicleStatus();

  const sedeOptions = useMemo<Option[]>(
    () => [
      ...sedes.map((sede) => ({
        value: sede.id.toString(),
        label: sede.abreviatura,
      })),
    ],
    [sedes]
  );
  const modelOptions = useMemo<Option[]>(
    () => [
      ...models.map((model) => ({
        value: model.id.toString(),
        label: model.version,
      })),
    ],
    [models]
  );

  const statusOptions = useMemo<Option[]>(
    () => [
      ...statuses.map((status) => ({
        value: status.id.toString(),
        label: status.description,
      })),
    ],
    [statuses]
  );

  return (
    <ResponsiveFilters
      title="Filtros"
      description="Filtra las órdenes de compra de vehículos"
      breakpoint="lg"
    >
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar ..."
      />

      <SearchableSelect
        options={sedeOptions}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Seleccionar sede"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />

      <SearchableSelect
        options={modelOptions}
        value={modelId}
        onChange={setModelId}
        placeholder="Seleccionar modelo"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />

      <SearchableSelect
        options={statusOptions}
        value={statusId}
        onChange={setStatusId}
        placeholder="Seleccionar estado"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />
    </ResponsiveFilters>
  );
}
