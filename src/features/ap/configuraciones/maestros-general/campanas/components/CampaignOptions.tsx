import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { AREA_OPTIONS } from "@/features/ap/ap-master/lib/apMaster.constants";
import { DISCOUNT_TYPE_OPTIONS } from "../lib/campaign.constants";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  areaId: string;
  setAreaId: (value: string) => void;
  discountType: string;
  setDiscountType: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export default function CampaignOptions({
  search,
  setSearch,
  areaId,
  setAreaId,
  discountType,
  setDiscountType,
  status,
  setStatus,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar campaña..."
      />
      <SearchableSelect
        options={AREA_OPTIONS}
        value={areaId}
        onChange={setAreaId}
        placeholder="Filtrar por área"
        className="min-w-48"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={DISCOUNT_TYPE_OPTIONS}
        value={discountType}
        onChange={setDiscountType}
        placeholder="Filtrar por tipo"
        className="min-w-44"
        classNameOption="text-xs"
      />
      <SearchableSelect
        options={[
          { value: "1", label: "Activo" },
          { value: "0", label: "Inactivo" },
        ]}
        value={status}
        onChange={setStatus}
        placeholder="Filtrar por estado"
        className="min-w-44"
        classNameOption="text-xs"
      />
    </div>
  );
}
