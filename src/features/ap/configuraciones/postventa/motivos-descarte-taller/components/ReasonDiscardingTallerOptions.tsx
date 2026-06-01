import SearchInput from "@/shared/components/SearchInput.tsx";

export default function ReasonDiscardingTallerOptions({
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
        placeholder="Buscar motivo de descarte..."
      />
    </div>
  );
}
