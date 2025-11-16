"use client";

import { SearchableSelect } from "@/src/shared/components/SearchableSelect";
import SearchInput from "@/src/shared/components/SearchInput";
import { ViewResource } from "../lib/view.interface";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  parents: ViewResource[];
  parentId: string;
  setParentId: (value: string) => void;
}

export default function ViewOptions({
  search,
  setSearch,
  parents = [],
  parentId,
  setParentId,
}: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar vista..."
      />
      <SearchableSelect
        options={parents.map((parent) => ({
          value: parent.id.toString(),
          label: parent.descripcion,
          description: parent.parent,
        }))}
        value={parentId}
        onChange={setParentId}
        placeholder="Filtrar por módulo"
        className="min-w-72"
        classNameOption="text-xs"
      />
    </div>
  );
}
