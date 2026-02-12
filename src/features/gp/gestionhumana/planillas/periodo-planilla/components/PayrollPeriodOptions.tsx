"use client";

import SearchInput from "@/shared/components/SearchInput";
import { PAYROLL_PERIOD } from "../lib/payroll-period.constant";

const { MODEL } = PAYROLL_PERIOD;

export default function PayrollPeriodOptions({
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
