import SearchInput from "@/shared/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PURCHASE_ORDER_STATUS } from "../lib/purchaseOrderProducts.constants";

interface PurchaseOrderProductsOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  statusFilter?: string;
  setStatusFilter?: (value: string) => void;
}

export default function PurchaseOrderProductsOptions({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: PurchaseOrderProductsOptionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número de orden, proveedor..."
      />
      {setStatusFilter && (
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {PURCHASE_ORDER_STATUS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
