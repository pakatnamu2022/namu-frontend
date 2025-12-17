"use client";

import { DataTable } from "@/shared/components/DataTable";
import type { ExpenseTypeColumns } from "./ExpenseTypeColumns";
import type { ExpenseTypeResource } from "../lib/expenseType.interface";

interface ExpenseTypeTableProps {
  columns: ExpenseTypeColumns[];
  data: ExpenseTypeResource[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function ExpenseTypeTable({
  columns,
  data,
  isLoading = false,
  children,
}: ExpenseTypeTableProps) {
  return <DataTable columns={columns} data={data} isLoading={isLoading}>{children}</DataTable>;
}
