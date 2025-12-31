"use client";

import { ExpenseResource } from "../lib/perDiemRequest.interface";
import { DataTable } from "@/shared/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";
import ExpenseRowActions from "./ExpenseRowActions";

interface ExpensesTableProps {
  expenses: ExpenseResource[];
  onActionComplete?: () => void;
  module: "gh" | "contabilidad" | "profile";
}

export default function ExpensesTable({
  expenses,
  onActionComplete,
  module,
}: ExpensesTableProps) {
  const columns: ColumnDef<ExpenseResource>[] = [
    {
      accessorKey: "expense_date",
      header: "Fecha",
      cell: ({ row }) => {
        const date = row.getValue("expense_date") as string;
        return (
          <span className="whitespace-nowrap">
            {format(new Date(date), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      },
    },
    {
      accessorKey: "expense_type",
      header: "Tipo",
      cell: ({ row }) => {
        const expense = row.original;
        // Manejar el caso cuando expense_type no viene del backend
        if (!expense.expense_type) {
          return <span className="text-xs text-muted-foreground">N/A</span>;
        }
        return (
          <div>
            <p className="font-medium text-sm">{expense.expense_type.name}</p>
            {expense.expense_type.parent && (
              <p className="text-xs text-muted-foreground">
                {expense.expense_type.parent.name}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "receipt_type",
      header: "Comprobante",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline" className="w-fit">
              {expense.receipt_type === "receipt" ? "Boleta" : "Factura"}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {expense.receipt_number}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "receipt_amount",
      header: "$ Factura",
      cell: ({ row }) => {
        const amount = row.getValue("receipt_amount") as number;
        return (
          <div className="text-right font-medium">S/ {amount.toFixed(2)}</div>
        );
      },
    },
    {
      accessorKey: "employee_amount",
      header: "$ Colaborador",
      cell: ({ row }) => {
        const amount = row.getValue("employee_amount") as number;
        return (
          <div className="text-right font-medium text-orange-600 dark:text-orange-500">
            S/ {amount.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "company_amount",
      header: "$ Empresa",
      cell: ({ row }) => {
        const amount = row.getValue("company_amount") as number;
        return (
          <div className="text-right font-medium text-blue-600 dark:text-blue-500">
            S/ {amount.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "validated",
      header: "Estado",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex items-center gap-2">
            {expense.validated ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-green-600">
                    Validado
                  </span>
                  {expense.validated_by && (
                    <span className="text-xs text-muted-foreground">
                      {expense.validated_by.name}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-600">
                  Pendiente
                </span>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <ExpenseRowActions
            expense={expense}
            onActionComplete={onActionComplete}
            module={module}
          />
        );
      },
    },
  ];

  return <DataTable columns={columns} data={expenses} variant="ghost" />;
}
