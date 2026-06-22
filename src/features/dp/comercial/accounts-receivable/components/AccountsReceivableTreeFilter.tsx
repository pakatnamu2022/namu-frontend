"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, X } from "lucide-react";
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

  const selectedSedeIds = filters.sede_id ?? [];
  const selectedStatuses = filters.overdue_status ?? [];
  const selectedYears = filters.due_year ?? [];

  const availableStatuses = tree
    .filter((s) => selectedSedeIds.includes(s.sede_id))
    .flatMap((s) => s.statuses)
    .reduce<{ status: string; years: number[] }[]>((acc, s) => {
      const existing = acc.find((a) => a.status === s.status);
      if (existing) {
        existing.years = [...new Set([...existing.years, ...s.years])];
      } else {
        acc.push({ status: s.status, years: [...s.years] });
      }
      return acc;
    }, []);

  const availableYears = availableStatuses
    .filter((s) => selectedStatuses.includes(s.status))
    .flatMap((s) => s.years)
    .filter((y, i, arr) => arr.indexOf(y) === i)
    .sort((a, b) => b - a);

  function toggleSede(sedeId: number) {
    const newIds = selectedSedeIds.includes(sedeId)
      ? selectedSedeIds.filter((id) => id !== sedeId)
      : [...selectedSedeIds, sedeId];

    const newAvailableStatusKeys = tree
      .filter((s) => newIds.includes(s.sede_id))
      .flatMap((s) => s.statuses.map((st) => st.status));
    const newStatuses = selectedStatuses.filter((s) =>
      newAvailableStatusKeys.includes(s),
    );

    onFiltersChange({
      sede_id: newIds.length ? newIds : null,
      overdue_status: newStatuses.length ? newStatuses : undefined,
      due_year: null,
    });
  }

  function toggleStatus(status: string) {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    onFiltersChange({
      overdue_status: newStatuses.length ? newStatuses : undefined,
      due_year: null,
    });
  }

  function toggleYear(year: number) {
    const newYears = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year];
    onFiltersChange({ due_year: newYears.length ? newYears : null });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center gap-2 h-8">
          {[80, 64, 96, 72, 88, 68].map((w, i) => (
            <div
              key={i}
              className="h-6 rounded-full bg-muted animate-pulse"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Fila 1 — Sede + Estado */}
      <div className="flex items-end gap-0 flex-wrap">
        <Level label="Sede" onClear={selectedSedeIds.length ? onReset : undefined}>
          <AnimatePresence mode="popLayout">
            {tree.map((sede, i) => (
              <Chip
                key={sede.sede_id}
                index={i}
                active={selectedSedeIds.includes(sede.sede_id)}
                onClick={() => toggleSede(sede.sede_id)}
              >
                {sede.sede_name}
              </Chip>
            ))}
          </AnimatePresence>
        </Level>

        <AnimatePresence>
          {selectedSedeIds.length > 0 && <Separator key="sep1" />}
        </AnimatePresence>

        <AnimatePresence>
          {selectedSedeIds.length > 0 && (
            <motion.div
              key="statuses"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <Level
                label="Estado"
                onClear={
                  selectedStatuses.length
                    ? () =>
                        onFiltersChange({
                          overdue_status: undefined,
                          due_year: null,
                        })
                    : undefined
                }
              >
                <AnimatePresence mode="popLayout">
                  {availableStatuses.map((s, i) => (
                    <Chip
                      key={s.status}
                      index={i}
                      active={selectedStatuses.includes(s.status)}
                      onClick={() => toggleStatus(s.status)}
                    >
                      {s.status}
                    </Chip>
                  ))}
                </AnimatePresence>
              </Level>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fila 2 — Año */}
      <AnimatePresence>
        {selectedStatuses.length > 0 && (
          <motion.div
            key="years"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Level
              label="Año"
              onClear={
                selectedYears.length
                  ? () => onFiltersChange({ due_year: null })
                  : undefined
              }
            >
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence mode="popLayout">
                  {availableYears.map((year, i) => (
                    <Chip
                      key={year}
                      index={i}
                      active={selectedYears.includes(year)}
                      onClick={() => toggleYear(year)}
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
  index: number;
  onClick: () => void;
}

function Chip({ children, active, index, onClick }: ChipProps) {
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
    </motion.button>
  );
}
