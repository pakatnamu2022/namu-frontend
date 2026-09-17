import { WarehouseResource } from "@/features/ap/configuraciones/maestros-general/almacenes/lib/warehouse.interface.ts";
import { BrandsResource } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.interface.ts";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect.tsx";
import SearchInput from "@/shared/components/SearchInput.tsx";

interface ShelfOption {
  id: number;
  label: string;
}

interface Props {
  search: string;
  setSearch: (value: string) => void;
  warehouses: WarehouseResource[];
  warehouseId: string;
  setWarehouseId: (value: string) => void;
  shelves?: ShelfOption[];
  productShelfId: string;
  setProductShelfId: (value: string) => void;
  brands?: BrandsResource[];
  brandId: string;
  setBrandId: (value: string) => void;
}

export default function InventoryOptions({
  search,
  setSearch,
  warehouses = [],
  warehouseId,
  setWarehouseId,
  shelves = [],
  productShelfId,
  setProductShelfId,
  brands = [],
  brandId,
  setBrandId,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar repuesto..."
      />
      <SearchableSelect
        options={warehouses.map((item) => ({
          value: item.id.toString(),
          label: item.dyn_code,
        }))}
        value={warehouseId}
        onChange={setWarehouseId}
        placeholder="Filtrar por almacén"
      />
      <SearchableSelect
        options={[
          { value: "all", label: "Todos los estantes" },
          ...shelves.map((item) => ({
            value: item.id.toString(),
            label: item.label,
          })),
        ]}
        value={productShelfId}
        onChange={setProductShelfId}
        placeholder="Filtrar por estante"
      />
      <SearchableSelect
        options={[
          { value: "all", label: "Todas las marcas" },
          ...brands.map((item) => ({
            value: item.id.toString(),
            label: item.name,
          })),
        ]}
        value={brandId}
        onChange={setBrandId}
        placeholder="Filtrar por marca"
      />
    </FilterWrapper>
  );
}
