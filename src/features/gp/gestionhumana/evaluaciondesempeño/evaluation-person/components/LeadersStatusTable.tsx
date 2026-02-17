import { DataTable } from "@/shared/components/DataTable";
import { LeaderStatusColumn } from "./LeadersStatusColumns";
import type {
  LeaderStatusEvaluationResource,
} from "../lib/evaluationPerson.interface";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
        <div className="flex items-center gap-2">
          {setSearch && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar líder..."
                value={search || ""}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          {children}
        </div>
      </DataTable>
    </div>
  );
}
