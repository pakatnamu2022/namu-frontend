"use client";

import RadioButton from "@/src/shared/components/RadioButton";
import SearchInput from "@/src/shared/components/SearchInput";
import { PARAMETER_TYPES } from "../lib/parameter.constans";

export default function ParameterOptions({
  search,
  setSearch,
  type,
  setType,
}: {
  search: string;
  setSearch: (value: string) => void;
  type: string;
  setType: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar parametro..."
      />

      <RadioButton options={PARAMETER_TYPES} active={type} onChange={setType} />
    </div>
  );
}
