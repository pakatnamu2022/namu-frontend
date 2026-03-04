import { useBrands } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.hook";
import { BrandsResource } from "@/features/ap/configuraciones/vehiculos/marcas/lib/brands.interface";
import { useModelsVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { ModelsVnResource } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { SedeResource } from "@/features/gp/maestro-general/sede/lib/sede.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { SearchableSelectAsync } from "@/shared/components/SearchableSelectAsync";
import SearchInput from "@/shared/components/SearchInput";

export default function PurchaseRequestQuoteOptions({
  search,
  setSearch,
  dateFrom,
  dateTo,
  setDateRange,
  sedes,
  sedeId,
  setSedeId,
  canViewBranches,
  selectedModelId,
  setSelectedModelId,
  selectedBrandId,
  setSelectedBrandId,
}: {
  search: string;
  setSearch: (value: string) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  setDateRange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  sedes: SedeResource[];
  sedeId: string;
  setSedeId: (value: string) => void;
  canViewBranches: boolean;
  selectedModelId: string;
  setSelectedModelId: (value: string) => void;
  selectedBrandId: string;
  setSelectedBrandId: (value: string) => void;
}) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar solicitudes / cotizaciones..."
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={setDateRange}
        placeholder="Seleccionar rango"
        dateFormat="d MMM yyyy"
        className="md:w-fit"
      />
      {canViewBranches && (
        <SearchableSelect
          value={sedeId}
          onChange={setSedeId}
          placeholder="Filtrar por sede"
          options={sedes.map((sede) => ({
            label: sede.abreviatura,
            value: sede.id.toString(),
          }))}
        />
      )}

      <SearchableSelectAsync
        useQueryHook={useBrands}
        mapOptionFn={(brand: BrandsResource) => ({
          label: brand.description,
          value: brand.id.toString(),
          description: brand.code,
        })}
        placeholder="Filtrar por marca"
        value={selectedBrandId ? selectedBrandId.toString() : ""}
        onChange={setSelectedBrandId}
      />

      <SearchableSelectAsync
        useQueryHook={useModelsVn}
        mapOptionFn={(model: ModelsVnResource) => ({
          label: model.version,
          value: model.id.toString(),
          description: model.code,
        })}
        placeholder="Filtrar por modelo"
        value={selectedModelId ? selectedModelId.toString() : ""}
        onChange={setSelectedModelId}
      />
    </FilterWrapper>
  );
}
