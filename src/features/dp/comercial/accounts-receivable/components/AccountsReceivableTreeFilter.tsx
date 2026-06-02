"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFilterTree } from "../lib/accountsReceivable.hook";
import type { AccountsReceivableFilters } from "../lib/accountsReceivable.interface";

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
  const selectedYear = filters.year ? Number(filters.year) : null;

  const selectedSede = tree.find((s) => s.sede_id === selectedSedeId) ?? null;
  const selectedStatusNode =
    selectedSede?.statuses.find((s) => s.status === selectedStatus) ?? null;

  const hasAnyFilter = !!(selectedSedeId || selectedStatus || selectedYear);

  function selectSede(sedeId: number) {
    if (selectedSedeId === sedeId && !sedeExpanded) {
      setSedeExpanded(true);
      return;
    }
    setSedeExpanded(false);
    setStatusExpanded(true);
    setYearExpanded(true);
    onFiltersChange({ sede_id: sedeId, overdue_status: undefined, year: null });
  }

  function selectStatus(status: string) {
    if (selectedStatus === status && !statusExpanded) {
      setStatusExpanded(true);
      return;
    }
    setStatusExpanded(false);
    setYearExpanded(true);
    onFiltersChange({ overdue_status: status, year: null });
  }

  function selectYear(year: number) {
    if (selectedYear === year && !yearExpanded) {
      setYearExpanded(true);
      return;
    }
    setYearExpanded(false);
    onFiltersChange({ year });
  }

  function handleReset() {
    setSedeExpanded(true);
    setStatusExpanded(true);
    setYearExpanded(true);
    onReset();
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
    <div className="flex items-start gap-0 flex-wrap">
      {/* Nivel 1 — Sede */}
      <Level label="Sede">
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
        {selectedSede && !sedeExpanded && (
          <Separator key="sep1" />
        )}
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
            <Level label="Estado">
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
        {selectedStatusNode && !statusExpanded && (
          <Separator key="sep2" />
        )}
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
            <Level label="Año">
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

      {/* Limpiar */}
      <AnimatePresence>
        {hasAnyFilter && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-0.5 mt-5 ml-2 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
          >
            <X className="size-3" />
            Limpiar
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-components ── */

function Level({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-0.5">
        {label}
      </span>
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
