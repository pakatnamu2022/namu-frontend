import SearchInput from "@/shared/components/SearchInput";

interface CommercialMastersOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function CommercialMastersOptions({
  search,
  setSearch,
}: CommercialMastersOptionsProps) {
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
