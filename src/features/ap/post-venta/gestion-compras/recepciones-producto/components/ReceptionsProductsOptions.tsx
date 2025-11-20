import SearchInput from "@/shared/components/SearchInput";

interface ReceptionsProductsOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function ReceptionsProductsOptions({
  search,
  setSearch,
}: ReceptionsProductsOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por orden de compra, factura, guía..."
      />
    </div>
  );
}
