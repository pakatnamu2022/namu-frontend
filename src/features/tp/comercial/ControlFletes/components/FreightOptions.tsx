"use client";

import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";


const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "1", label: "Activo"},
  { value: "0", label: "Inactivo"},
];


export default function FreightOptions({
  search,
  setSearch,
  status,
  setStatus,
}: {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  useStatus: string;
  setUseStatus: (value: string) => void;  
}){
     return (
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar ..."
          />
          <SearchableSelect
            onChange={setStatus}
            value={status}
            options={STATUS_OPTIONS}
            placeholder="Estado"
          />
        </div>
      );
}