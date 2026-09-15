import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import { ACTIVITY_STATUS_OPTIONS } from "../lib/activities.constants";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  status?: string;
  setStatus?: (value: string) => void;
}

export default function ActivitiesOptions({
  search,
  setSearch,
  status = "",
  setStatus,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar actividad..." />
      {setStatus && (
        <SearchableSelect
          value={status}
          onChange={setStatus}
          placeholder="Estado"
          options={ACTIVITY_STATUS_OPTIONS}
        />
      )}
    </FilterWrapper>
  );
}
