"use client";

import FilterWrapper from "@/shared/components/FilterWrapper";
import {
  KYC_STATUS_OPTIONS,
  PERSON_TYPES,
} from "../lib/declaracionJuradaKyc.constants";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface Props {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  personType: string;
  setPersonType: (val: string) => void;
}

export default function DeclaracionJuradaKycOptions({
  search,
  setSearch,
  status,
  setStatus,
  personType,
  setPersonType,
}: Props) {
  return (
    <FilterWrapper>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar..."
      />
      <SearchableSelect
        placeholder="Todos los tipos"
        options={[{ label: "Todos", value: "" }, ...PERSON_TYPES]}
        className="sm:max-w-[180px]"
        value={personType}
        onChange={setPersonType}
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
