import SearchInput from "@/shared/components/SearchInput";

interface GeneralMastersOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function GeneralMastersOptions({
  search,
  setSearch,
}: GeneralMastersOptionsProps) {
  return (
    <div className="flex gap-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por código, descripción o tipo..."
      />
    </div>
  );
}
