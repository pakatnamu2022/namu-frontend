"use client";

import { type WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { SearchableSelect } from "@/shared/components/SearchableSelect";

interface TechnicianProductivityFiltersBarProps {
  workers: WorkerResource[];
  workerId: string;
  setWorkerId: (value: string) => void;
  isWorkerLocked?: boolean;
  isLoadingWorkers?: boolean;
  sedeName?: string;
  dateFrom: Date | undefined;
  setDateFrom: (date: Date | undefined) => void;
  dateTo: Date | undefined;
  setDateTo: (date: Date | undefined) => void;
}

export default function TechnicianProductivityFiltersBar({
  workers,
  workerId,
  setWorkerId,
  isWorkerLocked,
  isLoadingWorkers,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
}: TechnicianProductivityFiltersBarProps) {
  return (
    <FilterWrapper>
      <SearchableSelect
        options={workers.map((item) => ({
          value: item.id.toString(),
          label: item.name,
        }))}
        value={workerId}
        onChange={setWorkerId}
        placeholder={isLoadingWorkers ? "Cargando..." : "Selecciona un técnico"}
        disabled={isLoadingWorkers || isWorkerLocked}
        className="min-w-72"
        classNameOption="text-xs"
        allowClear={false}
      />
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
        }}
        className="w-auto min-w-56"
      />
    </FilterWrapper>
  );
}
