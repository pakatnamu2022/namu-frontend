"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterTree } from "../lib/accountsReceivable.hook";
import type { AccountsReceivableFilters } from "../lib/accountsReceivable.interface";
import SearchInput from "@/shared/components/SearchInput";

interface Props {
  filters: AccountsReceivableFilters;
  onFiltersChange: (filters: Partial<AccountsReceivableFilters>) => void;
  onReset: () => void;
}

export default function AccountsReceivableTreeFilter({
  filters,
  onFiltersChange,
  onReset,
}: Props) {
  const { data: tree = [], isLoading } = useFilterTree();

  const [sedeExpanded, setSedeExpanded] = useState(true);
  const [statusExpanded, setStatusExpanded] = useState(true);
  const [yearExpanded, setYearExpanded] = useState(true);

  const selectedSedeId = filters.sede_id ? Number(filters.sede_id) : null;
  const selectedStatus = filters.overdue_status ?? null;
  const selectedYear = filters.due_year ? Number(filters.due_year) : null;

  const selectedSede = tree.find((s) => s.sede_id === selectedSedeId) ?? null;
  const selectedStatusNode =
    selectedSede?.statuses.find((s) => s.status === selectedStatus) ?? null;

  function selectSede(sedeId: number) {
    if (selectedSedeId === sedeId && !sedeExpanded) {
      setSedeExpanded(true);
      return;
    }
    setSedeExpanded(false);
    setStatusExpanded(true);
    setYearExpanded(true);
    onFiltersChange({
      sede_id: sedeId,
      overdue_status: undefined,
      due_year: null,
    });
  }

  function selectStatus(status: string) {
    if (selectedStatus === status && !statusExpanded) {
      setStatusExpanded(true);
      return;
    }
    setStatusExpanded(false);
    setYearExpanded(true);
    onFiltersChange({ overdue_status: status, due_year: null });
  }

  function selectYear(year: number) {
    if (selectedYear === year && !yearExpanded) {
      setYearExpanded(true);
      return;
    }
    setYearExpanded(false);
    onFiltersChange({ due_year: year });
  }

  function clearSede() {
    setSedeExpanded(true);
    setStatusExpanded(true);
    setYearExpanded(true);
    onReset();
  }

  function clearStatus() {
    setStatusExpanded(true);
    setYearExpanded(true);
    onFiltersChange({ overdue_status: undefined, due_year: null });
  }

  function clearYear() {
    setYearExpanded(true);
    onFiltersChange({ due_year: null });
  }

  const sedesVisible = sedeExpanded
    ? tree
    : tree.filter((s) => s.sede_id === selectedSedeId);

  const statusesVisible =
    selectedSede &&
    (statusExpanded
      ? selectedSede.statuses
      : selectedSede.statuses.filter((s) => s.status === selectedStatus));

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-8">
        {[80, 64, 96, 72, 88, 68].map((w, i) => (
          <div
            key={i}
            className="h-6 rounded-full bg-muted animate-pulse"
            style={{ width: w }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 flex-wrap">
      {/* Nivel 1 — Sede */}
      <Level label="Sede" onClear={selectedSedeId ? clearSede : undefined}>
        <AnimatePresence mode="popLayout">
          {sedesVisible.map((sede, i) => (
            <Chip
              key={sede.sede_id}
              index={i}
              active={selectedSedeId === sede.sede_id}
              collapsed={selectedSedeId === sede.sede_id && !sedeExpanded}
              onClick={() => selectSede(sede.sede_id)}
            >
              {sede.sede_name}
            </Chip>
          ))}
        </AnimatePresence>
      </Level>

      {/* Separador */}
      <AnimatePresence>
        {selectedSede && !sedeExpanded && <Separator key="sep1" />}
      </AnimatePresence>

      {/* Nivel 2 — Estado */}
      <AnimatePresence>
        {selectedSede && !sedeExpanded && (
          <motion.div
            key={`status-${selectedSede.sede_id}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Level
              label="Estado"
              onClear={selectedStatus ? clearStatus : undefined}
            >
              <AnimatePresence mode="popLayout">
                {(statusesVisible ?? []).map((s, i) => (
                  <Chip
                    key={s.status}
                    index={i}
                    active={selectedStatus === s.status}
                    collapsed={selectedStatus === s.status && !statusExpanded}
                    onClick={() => selectStatus(s.status)}
                  >
                    {s.status}
                  </Chip>
                ))}
              </AnimatePresence>
            </Level>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separador */}
      <AnimatePresence>
        {selectedStatusNode && !statusExpanded && <Separator key="sep2" />}
      </AnimatePresence>

      {/* Nivel 3 — Año */}
      <AnimatePresence>
        {selectedStatusNode && !statusExpanded && (
          <motion.div
            key={`year-${selectedSede?.sede_id}-${selectedStatus}`}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Level label="Año" onClear={selectedYear ? clearYear : undefined}>
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence mode="popLayout">
                  {(yearExpanded
                    ? selectedStatusNode.years
                    : selectedStatusNode.years.filter((y) => y === selectedYear)
                  ).map((year, i) => (
                    <Chip
                      key={year}
                      index={i}
                      active={selectedYear === year}
                      collapsed={selectedYear === year && !yearExpanded}
                      onClick={() => selectYear(year)}
                    >
                      {year}
                    </Chip>
                  ))}
                </AnimatePresence>
              </div>
            </Level>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v) => onFiltersChange({ search: v || undefined })}
        placeholder="Buscar cliente, doc..."
      />
    </div>
  );
}

/* ── Sub-components ── */

function Level({
  label,
  children,
  onClear,
}: {
  label: string;
  children: React.ReactNode;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1 px-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          {label}
        </span>
        <AnimatePresence>
          {onClear && (
            <motion.button
              key="clear"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              onClick={onClear}
              className="text-muted-foreground/50 hover:text-destructive transition-colors"
            >
              <X className="size-2.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Separator() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.15 }}
      className="flex items-center px-1 pt-[22px] text-muted-foreground/40"
    >
      <ChevronRight className="size-3.5" />
    </motion.div>
  );
}

interface ChipProps {
  children: React.ReactNode;
  active: boolean;
  collapsed: boolean;
  index: number;
  onClick: () => void;
}

function Chip({ children, active, collapsed, index, onClick }: ChipProps) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ delay: index * 0.025, duration: 0.15 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-0.5 px-2.5 py-0.5 text-xs rounded-full border font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
      {collapsed && <ChevronDown className="size-3 ml-0.5 opacity-70" />}
    </motion.button>
  );
}
