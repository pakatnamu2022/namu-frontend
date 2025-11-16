import SearchInput from "@/src/shared/components/SearchInput";

export default function EconomicActivityOptions({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar actividad económica..."
      />
    </div>
  );
}
