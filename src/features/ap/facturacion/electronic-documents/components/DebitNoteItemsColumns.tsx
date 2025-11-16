import { ColumnDef } from "@tanstack/react-table";
import { ElectronicDocumentItem } from "../lib/electronicDocument.interface";

export const debitNoteItemsColumns: ColumnDef<ElectronicDocumentItem>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => (
      <div className="font-medium text-center w-8">{row.index + 1}</div>
    ),
    size: 50,
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <div className="!text-wrap">
        <div
          className={`text-sm !text-wrap font-medium whitespace-pre-line ${
            row.original.anticipo_regularizacion ? "text-orange-600 italic" : ""
          }`}
        >
          {row.original.descripcion}
          {row.original.anticipo_regularizacion && (
            <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
              Regularización
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {row.original.unidad_de_medida}
        </div>
      </div>
    ),
    minSize: 200,
  },
  {
    accessorKey: "cantidad",
    header: () => <div className="text-right">Cant.</div>,
    cell: ({ getValue }) => {
      const cantidad = getValue() as number;
      return (
        <div className="text-right font-medium">
          {cantidad.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
    size: 80,
  },
  {
    accessorKey: "precio_unitario",
    header: () => <div className="text-right">P. Unit.</div>,
    cell: ({ getValue }) => {
      const precio = getValue() as number;
      return (
        <div className="text-right">
          S/{" "}
          {precio.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "subtotal",
    header: () => <div className="text-right">Subtotal</div>,
    cell: ({ getValue }) => {
      const subtotal = getValue() as number;
      return (
        <div className="text-right">
          S/{" "}
          {subtotal.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "igv",
    header: () => <div className="text-right">IGV</div>,
    cell: ({ getValue }) => {
      const igv = getValue() as number;
      return (
        <div className="text-right">
          S/{" "}
          {igv.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ getValue }) => {
      const total = getValue() as number;
      return (
        <div className="text-right font-semibold">
          S/{" "}
          {total.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
          })}
        </div>
      );
    },
    size: 120,
  },
];
