"use client";

import FilterWrapper from "@/shared/components/FilterWrapper";
import { KYC_STATUS_OPTIONS } from "../lib/declaracionJuradaKyc.constants";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
}

export default function DeclaracionJuradaKycOptions({
  search,
  setSearch,
  status,
  setStatus,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />
      <SearchableSelect
        placeholder="Todos los estados"
        options={[{ label: "Todos", value: "" }, ...KYC_STATUS_OPTIONS]}
        className="sm:max-w-[180px]"
        value={status}
        onChange={setStatus}
      />
    </FilterWrapper>
  );
}
