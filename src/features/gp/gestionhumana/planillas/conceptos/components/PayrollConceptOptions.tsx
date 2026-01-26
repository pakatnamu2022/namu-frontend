"use client";

import SearchInput from "@/shared/components/SearchInput";
import { PAYROLL_CONCEPT } from "../lib/payroll-concept.constant";

const { MODEL } = PAYROLL_CONCEPT;

interface PayrollConceptOptionsProps {
  search: string;
  setSearch: (value: string) => void;
}

export default function PayrollConceptOptions({
  search,
  setSearch,
}: PayrollConceptOptionsProps) {
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
