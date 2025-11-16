"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  EvaluationPersonResource,
  EvaluationPersonResultResource,
} from "../lib/evaluationPerson.interface";
import { evaluationPersonObjectiveColumns } from "./EvaluationPersonObjectiveColumns";
import TableSkeleton from "@/src/shared/components/TableSkeleton";
import EmptyState from "./EmptyState";
import ExpandableTableRow from "./ExpandableTableRow";
import EvaluationHeader from "./EvaluationHeader";
import EvaluationFooter from "./EvaluationFooter";

interface Props {
  evaluationPersonResult?: EvaluationPersonResultResource;
  details?: EvaluationPersonResource[];
  onUpdateCell: (id: number, value: any) => void;
  onCommentCell?: (id: number, comment: string) => void;
  readOnly?: boolean;
  showProgress?: boolean;
  isLoading?: boolean;
}

export default function EvaluationPersonObjectiveTable({
  evaluationPersonResult,
  details = [],
  onUpdateCell,
  onCommentCell,
  readOnly = false,
  showProgress = true,
  isLoading = false,
}: Props) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  if (!evaluationPersonResult) {
    return <TableSkeleton />;
  }

  // Early return si no hay datos
  if (!details || details.length === 0) {
    return <EmptyState />;
  }

  // Crear las columnas
  const columns = evaluationPersonObjectiveColumns({
    evaluationPersonResult,
    onUpdateCell,
    readOnly,
  });

  // Funciones para manejar comentarios y expansión
  const toggleRowExpansion = (rowId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId);
    } else {
      newExpandedRows.add(rowId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleCommentSubmit = (id: number, comment: string) => {
    onCommentCell?.(id, comment);
  };

  // Calcular estadísticas
  const totalObjectives = details.length;
  const completedObjectives = details.filter(
    (detail) => detail.wasEvaluated
  ).length;

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <EvaluationHeader
        evaluationPersonResult={evaluationPersonResult}
        completedObjectives={completedObjectives}
        totalObjectives={totalObjectives}
        showProgress={showProgress}
      />

      {/* Tabla principal */}
      <div className="overflow-hidden rounded-2xl border shadow-xs w-full">
        <div className="overflow-x-auto w-full">
          <Table className="text-xs md:text-sm">
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow className="text-nowrap h-10">
                {columns.map((column, index) => (
                  <TableHead key={index} className="h-10">
                    {typeof column.header === "function"
                      ? column.header({} as any)
                      : column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <div className="py-8">
                      <TableSkeleton />
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                details.map((detail, rowIndex) => (
                  <ExpandableTableRow
                    key={detail.id}
                    id={detail.id}
                    isExpanded={expandedRows.has(detail.id)}
                    onToggleExpansion={toggleRowExpansion}
                    columnsCount={columns.length}
                    comment={detail.comment}
                    readOnly={readOnly}
                    onCommentSubmit={handleCommentSubmit}
                  >
                    {/* Celdas de datos */}
                    {columns.map((column, cellIndex) => (
                      <TableCell key={cellIndex} className="p-2 truncate">
                        {column.cell && typeof column.cell === "function"
                          ? column.cell({
                              row: {
                                original: detail,
                                index: rowIndex,
                                id: detail.id.toString(),
                              },
                              column: {
                                id: column.id || cellIndex.toString(),
                              },
                              getValue: () => {
                                const key = column.id as keyof typeof detail;
                                return key && key in detail
                                  ? detail[key]
                                  : null;
                              },
                            } as any)
                          : column.cell || null}
                      </TableCell>
                    ))}
                  </ExpandableTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer con resumen */}
      <EvaluationFooter
        evaluationPersonResult={evaluationPersonResult}
        totalObjectives={totalObjectives}
        completedObjectives={completedObjectives}
      />
    </div>
  );
}
