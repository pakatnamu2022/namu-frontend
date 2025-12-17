"use client";

import { ExpenseResource } from "../lib/perDiemRequest.interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExpensesTableProps {
  expenses: ExpenseResource[];
}

export default function ExpensesTable({ expenses }: ExpensesTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay gastos registrados
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Concepto</TableHead>
            <TableHead className="text-right">Monto Comprobante</TableHead>
            <TableHead className="text-right">Monto Empresa</TableHead>
            <TableHead className="text-right">Monto Empleado</TableHead>
            <TableHead>Comprobante</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="whitespace-nowrap">
                {format(new Date(expense.expense_date), "dd/MM/yyyy", { locale: es })}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{expense.expense_type.name}</p>
                  {expense.expense_type.parent && (
                    <p className="text-xs text-muted-foreground">
                      {expense.expense_type.parent.name}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>{expense.concept}</TableCell>
              <TableCell className="text-right">
                S/ {expense.receipt_amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                S/ {expense.company_amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                S/ {expense.employee_amount.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="w-fit">
                    {expense.receipt_type === "receipt" ? "Boleta" : "Factura"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {expense.receipt_number}
                  </span>
                </div>
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {expense.receipt_path && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(expense.receipt_path, "_blank")}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
