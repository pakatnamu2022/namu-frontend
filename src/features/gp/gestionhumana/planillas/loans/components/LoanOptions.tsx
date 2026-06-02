"use client";

import SearchInput from "@/shared/components/SearchInput";
import { LOAN } from "../lib/loan.constant";

const { MODEL } = LOAN;

export default function LoanOptions({
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
