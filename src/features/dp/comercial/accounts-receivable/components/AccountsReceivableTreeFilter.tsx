"use client";

import { useState } from "react";
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

const columnVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.15, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.15 },
  }),
};

export default function AccountsReceivableTreeFilter({
  filters,
  onFiltersChange,
  onReset,
}: Props) {
  const { data: tree = [], isLoading } = useFilterTree();

  const selectedSedeId = filters.sede_id ? Number(filters.sede_id) : null;
  const selectedStatus = filters.overdue_status ?? null;
  const selectedYear = filters.year ? Number(filters.year) : null;

  const selectedSede = tree.find((s) => s.sede_id === selectedSedeId) ?? null;
  const selectedStatusNode = selectedSede?.statuses.find((s) => s.status === selectedStatus) ?? null;

  const hasAnyFilter = !!(selectedSedeId || selectedStatus || selectedYear);

  function selectSede(sedeId: number) {
    if (selectedSedeId === sedeId) {
      onFiltersChange({ sede_id: null, overdue_status: undefined, year: null });
    } else {
      onFiltersChange({ sede_id: sedeId, overdue_status: undefined, year: null });
    }
  }

  function selectStatus(status: string) {
    if (selectedStatus === status) {
      onFiltersChange({ overdue_status: undefined, year: null });
    } else {
      onFiltersChange({ overdue_status: status, year: null });
    }
  }

  function selectYear(year: number) {
    if (selectedYear === year) {
      onFiltersChange({ year: null });
    } else {
      onFiltersChange({ year });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-8">
        {[80, 64, 96, 72].map((w, i) => (
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
    <div className="flex items-start gap-0">
      {/* Column 1 — Sedes */}
      <Column label="Sede">
        <div className="flex flex-wrap gap-1.5">
          {tree.map((sede, i) => (
            <motion.button
              key={sede.sede_id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              onClick={() => selectSede(sede.sede_id)}
              className={cn(
                "px-2.5 py-0.5 text-xs rounded-full border font-medium transition-colors",
                selectedSedeId === sede.sede_id
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
              )}
            >
              {sede.sede_name}
            </motion.button>
          ))}
        </div>
      </Column>

      {/* Divider arrow */}
      <AnimatePresence>
        {selectedSede && (
          <motion.div
            key="arrow1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="flex items-center px-1 pt-[22px] text-muted-foreground/50"
          >
            <ChevronRight className="size-3.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Column 2 — Status */}
      <AnimatePresence>
        {selectedSede && (
          <motion.div
            key={`status-col-${selectedSede.sede_id}`}
            variants={columnVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Column label="Estado">
              <div className="flex flex-wrap gap-1.5">
                {selectedSede.statuses.map((s, i) => (
                  <motion.button
                    key={s.status}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => selectStatus(s.status)}
                    className={cn(
                      "px-2.5 py-0.5 text-xs rounded-full border font-medium transition-colors",
                      selectedStatus === s.status
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {s.status}
                  </motion.button>
                ))}
              </div>
            </Column>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider arrow */}
      <AnimatePresence>
        {selectedStatusNode && (
          <motion.div
            key="arrow2"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="flex items-center px-1 pt-[22px] text-muted-foreground/50"
          >
            <ChevronRight className="size-3.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Column 3 — Years */}
      <AnimatePresence>
        {selectedStatusNode && (
          <motion.div
            key={`year-col-${selectedSede?.sede_id}-${selectedStatus}`}
            variants={columnVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Column label="Año">
              <div className="flex flex-wrap gap-1.5">
                {selectedStatusNode.years.map((year, i) => (
                  <motion.button
                    key={year}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => selectYear(year)}
                    className={cn(
                      "px-2.5 py-0.5 text-xs rounded-full border font-medium transition-colors",
                      selectedYear === year
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    {year}
                  </motion.button>
                ))}
              </div>
            </Column>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear button */}
      <AnimatePresence>
        {hasAnyFilter && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-0.5 mt-[20px] ml-2 text-xs text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
          >
            <X className="size-3" />
            Limpiar
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function Column({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-0.5">
        {label}
      </span>
      {children}
    </div>
  );
}
