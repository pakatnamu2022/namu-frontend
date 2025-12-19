import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import ResponsiveFilters from "@/shared/components/ResponsiveFilters";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useAllVehicleStatus } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.hook";
import { useAllWarehouse } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.hook";
import { Option } from "@/core/core.interface";
import { useMemo } from "react";
import ExportButtons from "@/shared/components/ExportButtons";
import { EXHIBITION_VEHICLES } from "../lib/exhibitionVehicles.constants";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  advisorId?: string;
  setAdvisorId: (value: string) => void;
  vehicleStatusIds: string[];
  setVehicleStatusIds: (value: string[]) => void;
  propietarioId?: string;
  setPropietarioId: (value: string) => void;
  status?: string;
  setStatus: (value: string) => void;
  ubicacionId?: string;
  setUbicacionId: (value: string) => void;
}

export default function ExhibitionVehiclesOptions({
  search,
  setSearch,
  advisorId = "all",
  setAdvisorId,
  vehicleStatusIds,
  setVehicleStatusIds,
  propietarioId = "all",
  setPropietarioId,
  status = "all",
  setStatus,
  ubicacionId = "all",
  setUbicacionId,
}: Props) {
  const { data: workers = [] } = useAllWorkers();
  const { data: vehicleStatuses = [] } = useAllVehicleStatus();
  const { data: warehouses = [] } = useAllWarehouse();

  const advisorOptions = useMemo<Option[]>(
    () => [
      ...workers.map((worker) => ({
        value: worker.id.toString(),
        label: worker.name,
      })),
    ],
    [workers]
  );

  const propietarioOptions = useMemo<Option[]>(
    () => [
      ...workers.map((worker) => ({
        value: worker.id.toString(),
        label: worker.name,
      })),
    ],
    [workers]
  );

  const vehicleStatusOptions = useMemo<Option[]>(
    () => [
      ...vehicleStatuses.map((status) => ({
        value: status.id.toString(),
        label: status.description,
      })),
    ],
    [vehicleStatuses]
  );

  const ubicacionOptions = useMemo<Option[]>(
    () => [
      ...warehouses.map((warehouse) => ({
        value: warehouse.id.toString(),
        label: warehouse.description,
      })),
    ],
    [warehouses]
  );

  const statusOptions: Option[] = [
    { value: "1", label: "Activo" },
    { value: "0", label: "Inactivo" },
  ];

  return (
    <ResponsiveFilters
      title="Filtros"
      description="Filtra los vehículos de exhibición"
      breakpoint="lg"
    >
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />

      <SearchableSelect
        options={advisorOptions}
        value={advisorId}
        onChange={setAdvisorId}
        placeholder="Seleccionar asesor"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />

      <SearchableSelect
        options={vehicleStatusOptions}
        value={vehicleStatusIds[0] || "all"}
        onChange={(value) => setVehicleStatusIds(value === "all" ? [] : [value])}
        placeholder="Seleccionar estado de vehículo"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />

      <SearchableSelect
        options={propietarioOptions}
        value={propietarioId}
        onChange={setPropietarioId}
        placeholder="Seleccionar propietario"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />

      <SearchableSelect
        options={statusOptions}
        value={status}
        onChange={setStatus}
        placeholder="Seleccionar estado"
        className="min-w-[200px]"
        classNameOption="text-xs"
      />

      <SearchableSelect
        options={ubicacionOptions}
        value={ubicacionId}
        onChange={setUbicacionId}
        placeholder="Seleccionar ubicación"
        className="min-w-[250px]"
        classNameOption="text-xs"
      />

      <ExportButtons
        excelEndpoint={EXHIBITION_VEHICLES.ENDPOINT_EXPORT_EXCEL}
        pdfEndpoint={EXHIBITION_VEHICLES.ENDPOINT_EXPORT_PDF}
        excelFileName="vehiculos-exhibicion.xlsx"
        pdfFileName="vehiculos-exhibicion.pdf"
        variant="grouped"
      />
    </ResponsiveFilters>
  );
}
