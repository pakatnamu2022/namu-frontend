import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";

interface PlanningOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  workers: WorkerResource[];
  workerId: string;
  setWorkerId: (value: string) => void;
}

export default function PlanningOptions({
  search,
  setSearch,
  workers,
  workerId,
  setWorkerId,
}: PlanningOptionsProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por orden de trabajo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2 items-center">
        <Select
          value={workerId || "all"}
          onValueChange={(value) => setWorkerId(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los operarios" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los operarios</SelectItem>
            {workers.map((worker) => (
              <SelectItem key={worker.id} value={String(worker.id)}>
                {worker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
