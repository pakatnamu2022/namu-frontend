import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
}

export default function ApBankOptions({
  search,
  setSearch,
  sedes = [],
  sedeId,
  setSedeId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar chequera..."
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
    </div>
  );
}
