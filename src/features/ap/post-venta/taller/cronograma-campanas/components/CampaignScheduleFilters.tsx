import { type WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  trabajadores: WorkerResource[];
  workerId: string;
  setWorkerId: (value: string) => void;
  isWorkerLocked?: boolean;
  isLoadingTrabajadores?: boolean;
}

export default function CampaignScheduleFilters({
  sedes = [],
  sedeId,
  setSedeId,
  trabajadores = [],
  workerId,
  setWorkerId,
  isWorkerLocked = false,
  isLoadingTrabajadores = false,
}: Props) {
  return (
    <FilterWrapper>
      <SearchableSelect
        options={sedes.map((item) => ({
          value: item.id.toString(),
          label: item.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
        allowClear={false}
      />
      <SearchableSelect
        options={trabajadores.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }))}
        value={workerId}
        onChange={setWorkerId}
        placeholder={
          isLoadingTrabajadores ? "Cargando..." : "Seleccionar técnico"
        }
        allowClear={false}
        disabled={isWorkerLocked || isLoadingTrabajadores}
      />
    </FilterWrapper>
  );
}
