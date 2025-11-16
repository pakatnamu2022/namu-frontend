import { useNavigate } from 'react-router-dom';
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { USER_SERIES_ASSIGNMENT } from "../lib/userSeriesAssignment.constants";
import {
  UserSeriesAssignmentResource,
  VouchersResource,
} from "../lib/userSeriesAssignment.interface";

export type UserSeriesAssignmentColumns =
  ColumnDef<UserSeriesAssignmentResource>;

interface Props {
  permissions: {
    canUpdate: boolean;
  };
}

export const userSeriesAssignmentColumns = ({
  permissions,
}: Props): UserSeriesAssignmentColumns[] => [
  {
    accessorKey: "worker_name",
    header: "Trabajador",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return value && <p className="font-semibold">{value}</p>;
    },
  },
  {
    accessorKey: "vouchers",
    header: "Comprobantes",
    cell: ({ getValue }) => {
      const vouchers = getValue() as VouchersResource[];
      if (!vouchers || vouchers.length === 0) {
        return (
          <span className="text-gray-400 italic">
            Sin comprobantes asignados
          </span>
        );
      }

      return (
        <div className="flex flex-wrap gap-1">
          {vouchers.map((voucher) => (
            <span
              key={voucher.id}
              className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
            >
              {voucher.series} - {voucher.sede}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const router = useNavigate();
      const { worker_id } = row.original;
      const { ROUTE_UPDATE } = USER_SERIES_ASSIGNMENT;

      return (
        <div className="flex items-center gap-2">
          {permissions.canUpdate && (
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => router(`${ROUTE_UPDATE}/${worker_id}`)}
            >
              <Pencil className="size-5" />
            </Button>
          )}
        </div>
      );
    },
  },
];
