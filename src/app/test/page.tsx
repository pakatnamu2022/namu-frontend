"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TestPage() {
  return (
    <div className="p-4 bg-red-50 h-screen w-screen overflow-auto">
      <div className="overflow-x-auto w-full border rounded-lg">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead>Columna 1</TableHead>
              <TableHead>Columna 2</TableHead>
              <TableHead>Columna 3</TableHead>
              <TableHead>Columna 4</TableHead>
              <TableHead>Columna 5</TableHead>
              <TableHead>Columna 6</TableHead>
              <TableHead>Columna 7</TableHead>
              <TableHead>Columna 8</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                {Array(8)
                  .fill(null)
                  .map((_, j) => (
                    <TableCell key={j}>
                      Dato {i}-{j}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
