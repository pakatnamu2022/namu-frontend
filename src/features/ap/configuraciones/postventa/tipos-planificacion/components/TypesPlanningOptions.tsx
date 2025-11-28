import SearchInput from "@/shared/components/SearchInput.tsx";

export default function TypesPlanningOptions({
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
        placeholder="Buscar tipo de planificación..."
      />
    </div>
  );
}
