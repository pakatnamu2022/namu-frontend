import SearchInput from "@/shared/components/SearchInput";

interface PurchaseOrderProductsOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function PurchaseOrderProductsOptions({
  search,
  setSearch,
}: PurchaseOrderProductsOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número de orden, proveedor..."
      />
    </div>
  );
}
