import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";

interface GeneralMastersOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  showTypeSelect?: boolean;
  typeOptions?: string[];
  typeLabels?: Record<string, string>;
  selectedType?: string;
  setSelectedType?: (value: string) => void;
}

export default function GeneralMastersOptions({
  search,
  setSearch,
  showTypeSelect = false,
  typeOptions = [],
  typeLabels,
  selectedType = "",
  setSelectedType,
}: GeneralMastersOptionsProps) {
  return (
    <div className="flex gap-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por código, descripción o tipo..."
      />

      {showTypeSelect && (
        <SearchableSelect
          options={typeOptions.map((type) => ({
            value: type,
            label: typeLabels?.[type] ?? type,
          }))}
          value={selectedType}
          onChange={(value) => setSelectedType?.(value)}
          placeholder="Filtrar por tipo"
          className="min-w-48"
          classNameOption="text-xs"
          allowClear={true}
        />
      )}
    </div>
  );
}
