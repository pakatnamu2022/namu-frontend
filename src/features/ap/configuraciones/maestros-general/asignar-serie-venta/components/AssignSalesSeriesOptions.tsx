import { TypesOperationResource } from "@/src/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.interface";
import { SedeResource } from "@/src/features/gp/maestro-general/sede/lib/sede.interface";
import SearchInput from "@/src/shared/components/SearchInput";
import { SearchableSelect } from "@/src/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  typesOperation: TypesOperationResource[];
  typeOperationId: string;
  setTypeOperationId: (value: string) => void;
}

export default function AssignSalesSeriesOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  typesOperation = [],
  typeOperationId,
  setTypeOperationId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar serie..."
      />
      <SearchableSelect
        options={sedes.map((sede) => ({
          value: sede.id.toString(),
          label: sede.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Filtrar por sede"
        className="min-w-72"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={typesOperation.map((typeOperation) => ({
          value: typeOperation.id.toString(),
          label: typeOperation.description,
        }))}
        value={typeOperationId}
        onChange={setTypeOperationId}
        placeholder="Filtrar por tipo de operación"
        className="min-w-72"
        classNameOption="text-xs"
      />
    </div>
  );
}
