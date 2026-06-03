"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { errorToast } from "@/core/core.function";
import GeneralSheet from "@/shared/components/GeneralSheet";
import type { ViewRoleItem } from "../lib/view.interface";
import { getViewRoles } from "../lib/view.actions";

interface Props {
  viewId: number | null;
  viewName?: string;
  open: boolean;
  onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  basic: "bg-blue-100 text-blue-700 border-blue-200",
  special: "bg-purple-100 text-purple-700 border-purple-200",
};

export default function ViewRolesSheet({ viewId, viewName, open, onClose }: Props) {
  const [roles, setRoles] = useState<ViewRoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open || !viewId) return;

    const fetchRoles = async () => {
      setIsLoading(true);
      try {
        const data = await getViewRoles(viewId);
        setRoles(data);
      } catch (error: any) {
        errorToast("Error al cargar los roles", error.response?.data?.message?.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [open, viewId]);

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={viewName ? `Roles con acceso: ${viewName}` : "Roles con acceso"}
      icon="Users"
      size="2xl"
      isLoading={isLoading}
    >
      <div className="space-y-3">
        {roles.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <Users className="size-8 opacity-40" />
            <p className="text-sm">No hay roles con acceso a esta vista.</p>
          </div>
        )}

        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border bg-card px-4 py-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">{role.nombre}</p>
                {role.descripcion && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{role.descripcion}</p>
                )}
              </div>
              <Badge variant="outline" className="text-xs shrink-0">
                {(role.permissions ?? []).length} permiso{(role.permissions ?? []).length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(role.permissions ?? []).map((perm) => (
                <span
                  key={perm.id}
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${
                    TYPE_COLORS[perm.type] ?? "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {perm.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </GeneralSheet>
  );
}
