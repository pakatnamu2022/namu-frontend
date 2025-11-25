import { TypesOperationResource } from "@/features/ap/configuraciones/maestros-general/tipos-operacion/lib/typesOperation.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  typesOperation: TypesOperationResource[];
  typeOperationId: string;
  setTypeOperationId: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  isReceived: string;
  setIsReceived: (value: string) => void;
}

export default function ParentWarehouseOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
  typesOperation = [],
  typeOperationId,
  setTypeOperationId,
  isReceived,
  setIsReceived,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar almacén..."
      />
      <SearchableSelect
        options={sedes.map((sede) => ({
          value: sede.id.toString(),
          label: sede.abreviatura,
        }))}
        value={sedeId}
        onChange={setSedeId}
        placeholder="Seleccionar Sede"
        className="min-w-48"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={typesOperation.map((typeOperation) => ({
          value: typeOperation.id.toString(),
          label: typeOperation.description,
        }))}
        value={typeOperationId}
        onChange={(value) => {
          setTypeOperationId(value);
        }}
        placeholder="Seleccionar Operación"
        className="min-w-40"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={[
          { value: "1", label: "ALMACEN" },
          { value: "0", label: "POR RECIBIR" },
        ]}
        value={isReceived}
        onChange={setIsReceived}
        placeholder="Seleccionar Recepción"
        className="min-w-44"
        classNameOption="text-xs"
      />
    </div>
  );
}
