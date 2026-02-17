import { DataTable } from "@/shared/components/DataTable";
import { LeaderStatusColumn } from "./LeadersStatusColumns";
import type { LeaderStatusEvaluationResource } from "../lib/evaluationPerson.interface";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";

interface Props {
  columns: LeaderStatusColumn[];
  data: LeaderStatusEvaluationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
  search?: string;
  setSearch?: (search: string) => void;
}

export default function LeadersStatusTable({
  columns,
  data,
  children,
  isLoading,
  search,
  setSearch,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          dni: false,
          sede: false,
          area: false,
        }}
      >
        <FilterWrapper>
          {setSearch && (
            <SearchInput
              onChange={setSearch}
              placeholder="Buscar líder..."
              value={search || ""}
            />
          )}
          {children}
        </FilterWrapper>
      </DataTable>
    </div>
  );
}
