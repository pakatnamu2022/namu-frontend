import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Package } from "lucide-react";

export interface DetailSheetTableColumn<T> {
  header: string;
  className?: string;
  render: (row: T, index: number) => React.ReactNode;
}

interface DetailSheetTableProps<T> {
  rows: T[];
  columns: DetailSheetTableColumn<T>[];
  getKey: (row: T, index: number) => string | number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  footer?: React.ReactNode;
}

export function DetailSheetTable<T>({
  rows,
  columns,
  getKey,
  emptyMessage = "No hay elementos para mostrar",
  emptyIcon,
  footer,
}: DetailSheetTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {emptyIcon ?? <Package className="h-12 w-12 text-muted-foreground mb-4" />}
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col, i) => (
                <TableHead key={i} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={getKey(row, index)}>
                {columns.map((col, i) => (
                  <TableCell key={i} className={col.className}>
                    {col.render(row, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {footer}
    </div>
  );
}
