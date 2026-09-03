import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { MIGRATION_STATUS } from "../lib/assets.constants";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  migrationStatus: string;
  setMigrationStatus: (value: string) => void;
}

export default function AssetsOptions({
  search,
  setSearch,
  migrationStatus,
  setMigrationStatus,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por VIN, placa o responsable..."
      />
      <SearchableSelect
        options={MIGRATION_STATUS.map((s) => ({ value: s.value, label: s.label }))}
        value={migrationStatus}
        onChange={setMigrationStatus}
        placeholder="Estado de migración"
        className="min-w-52"
        classNameOption="text-xs"
      />
    </div>
  );
}
