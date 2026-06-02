"use client";

import SearchInput from "@/shared/components/SearchInput";
import { INSURANCE } from "../lib/insurance.constant";

const { MODEL } = INSURANCE;

export default function InsuranceOptions({
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
        placeholder={`Buscar ${MODEL.name}...`}
      />
    </div>
  );
}
