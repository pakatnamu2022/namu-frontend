"use client";

import { useState, useMemo, useEffect } from "react";
import { PermissionsActions } from "./PermissionsActions";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "@/core/core.function";
import { api } from "@/core/api";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/shared/components/GeneralModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  ShieldCheck,
  Layers,
  Building2,
  FolderTree,
  CheckSquare,
  SquareX,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  MinusCircle,
  Minus,
} from "lucide-react";

interface PermissionPreviewItem {
  id: number;
  code: string;
  name: string;
  module: string;
}

interface SyncPreview {
  role: { id: number; name: string };
  to_assign: PermissionPreviewItem[];
  to_remove: PermissionPreviewItem[];
  unchanged: PermissionPreviewItem[];
}
import { useAllViewPermission } from "@/features/gp/gestionsistema/vistas/lib/view.hook";
import type { View } from "@/features/gp/gestionsistema/vistas/lib/view.interface";
import * as LucideIcons from "lucide-react";
import { ROLE } from "../../roles/lib/role.constants";

export default function PermissionsForm({ id }: { id: number }) {
  const { ABSOLUTE_ROUTE } = ROLE;
  const router = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<number, Set<number>>
  >({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [initialAssigned, setInitialAssigned] = useState<Record<number, Set<number>>>({});
  const [previewData, setPreviewData] = useState<SyncPreview | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load all views once — search is done client-side
  const { data: viewsData, isLoading } = useAllViewPermission({
    rol_id: id,
    all: 1,
  });

  const allViews = useMemo(() => viewsData ?? [], [viewsData]);

  // Initialize selected permissions from is_assigned
  useEffect(() => {
    if (!viewsData) return;
    const initial: Record<number, Set<number>> = {};
    viewsData.forEach((view) => {
      const assigned =
        view.permissions?.filter((p) => p.is_assigned).map((p) => p.id) ?? [];
      if (assigned.length > 0) initial[view.id] = new Set(assigned);
    });
    setInitialAssigned(initial);
    setSelectedPermissions(initial);
  }, [viewsData]);

  // Client-side filter
  const filteredViews = useMemo(() => {
    if (!searchTerm.trim()) return allViews;
    const lower = searchTerm.toLowerCase();
    return allViews.filter(
      (v) =>
        v.descripcion.toLowerCase().includes(lower) ||
        v.route?.toLowerCase().includes(lower) ||
        v.padre?.toLowerCase().includes(lower) ||
        v.company?.toLowerCase().includes(lower),
    );
  }, [allViews, searchTerm]);

  // Group by company → parent_id (use padre string only as display label)
  const groupedViews = useMemo(() => {
    const groups: Record<string, Record<string, { label: string; views: View[] }>> = {};
    filteredViews.forEach((view) => {
      const company = view.company ?? "Sin empresa";
      const parentKey = view.parent_id != null ? String(view.parent_id) : "root";
      const parentLabel = view.padre ?? "General";
      if (!groups[company]) groups[company] = {};
      if (!groups[company][parentKey]) groups[company][parentKey] = { label: parentLabel, views: [] };
      groups[company][parentKey].views.push(view);
    });
    return groups;
  }, [filteredViews]);

  // Auto-expand all groups when searching
  useEffect(() => {
    if (!searchTerm.trim()) return;
    const keys = new Set<string>();
    Object.entries(groupedViews).forEach(([company, padres]) => {
      keys.add(`c:${company}`);
      Object.keys(padres).forEach((pk) => keys.add(`p:${company}:${pk}`));
    });
    setExpandedGroups(keys);
  }, [searchTerm, groupedViews]);

  const selectedView = useMemo(
    () => allViews.find((v) => v.id === selectedViewId) ?? null,
    [allViews, selectedViewId],
  );

  const totalSelected = useMemo(
    () => Object.values(selectedPermissions).reduce((acc, s) => acc + s.size, 0),
    [selectedPermissions],
  );

  const totalAvailable = useMemo(
    () => allViews.reduce((acc, v) => acc + (v.permissions?.length ?? 0), 0),
    [allViews],
  );

  const handleToggleAll = () => {
    const allSelected = totalSelected === totalAvailable && totalAvailable > 0;
    if (allSelected) {
      setSelectedPermissions({});
    } else {
      const all: Record<number, Set<number>> = {};
      allViews.forEach((v) => {
        if (v.permissions?.length) all[v.id] = new Set(v.permissions.map((p) => p.id));
      });
      setSelectedPermissions(all);
    }
  };

  const handleToggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleTogglePermission = (viewId: number, permissionId: number) => {
    setSelectedPermissions((prev) => {
      const set = new Set(prev[viewId] ?? []);
      set.has(permissionId) ? set.delete(permissionId) : set.add(permissionId);
      return { ...prev, [viewId]: set };
    });
  };

  const handleSelectAllView = (viewId: number) => {
    const view = allViews.find((v) => v.id === viewId);
    if (!view?.permissions?.length) return;
    const allIds = view.permissions.map((p) => p.id);
    const current = selectedPermissions[viewId] ?? new Set<number>();
    const allSelected = allIds.every((pid) => current.has(pid));
    setSelectedPermissions((prev) => ({
      ...prev,
      [viewId]: allSelected ? new Set() : new Set(allIds),
    }));
  };

  const buildPayload = () => {
    const permissionIds = Object.values(selectedPermissions).flatMap((s) => [...s]);
    const permissionsToRemove: number[] = [];
    Object.entries(initialAssigned).forEach(([viewId, assignedSet]) => {
      const current = selectedPermissions[Number(viewId)] ?? new Set<number>();
      assignedSet.forEach((pid) => {
        if (!current.has(pid)) permissionsToRemove.push(pid);
      });
    });
    return { permissionIds, permissionsToRemove };
  };

  const handleSave = async () => {
    const { permissionIds, permissionsToRemove } = buildPayload();
    if (permissionIds.length === 0) {
      errorToast("Selecciona al menos un permiso para guardar");
      return;
    }
    setIsPreviewing(true);
    try {
      const { data } = await api.post<SyncPreview>(
        "/configuration/permission/preview-permissions-sync",
        { role_id: id, permissions: permissionIds, permissions_to_remove: permissionsToRemove },
      );
      setPreviewData(data);
      setPreviewOpen(true);
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? "Error al obtener vista previa");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirmSave = async () => {
    const { permissionIds, permissionsToRemove } = buildPayload();
    setIsSaving(true);
    try {
      await api.post("/configuration/permission/save-permissions-to-role", {
        role_id: id,
        permissions: permissionIds,
        permissions_to_remove: permissionsToRemove,
      });
      successToast("Permisos sincronizados correctamente");
      setPreviewOpen(false);
      setPreviewData(null);
      setInitialAssigned(
        Object.fromEntries(
          Object.entries(selectedPermissions).map(([k, s]) => [k, new Set(s)]),
        ),
      );
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? "Error al sincronizar permisos");
    } finally {
      setIsSaving(false);
    }
  };

  const getIcon = (iconName: string | null | undefined, fallback: any) => {
    if (!iconName) return fallback;
    return (LucideIcons as any)[iconName] ?? fallback;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-3">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="text-sm font-normal shrink-0">
          {totalSelected} permiso{totalSelected !== 1 ? "s" : ""} seleccionados
        </Badge>
        <Button variant="outline" size="sm" onClick={handleToggleAll} disabled={totalAvailable === 0}>
          {totalSelected === totalAvailable && totalAvailable > 0 ? (
            <><SquareX className="size-3.5 mr-1.5" />Quitar todos</>
          ) : (
            <><CheckSquare className="size-3.5 mr-1.5" />Seleccionar todos</>
          )}
        </Button>
        <div className="ml-auto">
          <PermissionsActions
            onCancel={() => router(ABSOLUTE_ROUTE)}
            onSave={handleSave}
            isSaving={isPreviewing || isSaving}
          />
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex border rounded-xl overflow-hidden h-[calc(100vh-16rem)] min-h-96">
        {/* LEFT: Grouped view tree */}
        <div className="w-72 shrink-0 border-r flex flex-col bg-muted/20">
          <div className="px-3 py-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Vistas ({filteredViews.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
              </div>
            ) : Object.entries(groupedViews).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Search className="size-8 opacity-30" />
                <span className="text-sm">Sin resultados</span>
              </div>
            ) : (
              Object.entries(groupedViews).map(([company, padres]) => {
                const ck = `c:${company}`;
                const companyExpanded = expandedGroups.has(ck);
                const companySelected = Object.values(padres)
                  .flatMap((g) => g.views)
                  .reduce(
                    (acc, v) => acc + (selectedPermissions[v.id]?.size ?? 0),
                    0,
                  );

                return (
                  <div key={company}>
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => handleToggleGroup(ck)}
                    >
                      <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-sm font-medium truncate">
                        {company}
                      </span>
                      {companySelected > 0 && (
                        <Badge size="sm" className="text-[10px] shrink-0">
                          {companySelected}
                        </Badge>
                      )}
                      {companyExpanded ? (
                        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {companyExpanded &&
                      Object.entries(padres).map(([pk, { label, views }]) => {
                        const expandKey = `p:${company}:${pk}`;
                        const padreExpanded = expandedGroups.has(expandKey);
                        const padreSelected = views.reduce(
                          (acc, v) =>
                            acc + (selectedPermissions[v.id]?.size ?? 0),
                          0,
                        );

                        return (
                          <div key={pk}>
                            <button
                              className="w-full flex items-center gap-2 pl-6 pr-3 py-1.5 text-left hover:bg-muted/50 transition-colors"
                              onClick={() => handleToggleGroup(expandKey)}
                            >
                              <FolderTree className="size-3 shrink-0 text-muted-foreground" />
                              <span className="flex-1 text-xs text-muted-foreground truncate">
                                {label}
                              </span>
                              {padreSelected > 0 && (
                                <Badge
                                  size="sm"
                                  variant="outline"
                                  className="text-[10px] shrink-0"
                                >
                                  {padreSelected}
                                </Badge>
                              )}
                              {padreExpanded ? (
                                <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
                              )}
                            </button>

                            {padreExpanded &&
                              views.map((view) => {
                                const ViewIcon = getIcon(view.icon, Layers);
                                const count =
                                  selectedPermissions[view.id]?.size ?? 0;
                                const isActive = selectedViewId === view.id;

                                return (
                                  <button
                                    key={view.id}
                                    className={`w-full flex items-center gap-2 pl-10 pr-3 py-1.5 text-left transition-colors ${
                                      isActive
                                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                                        : "hover:bg-muted/50 text-foreground"
                                    }`}
                                    onClick={() => setSelectedViewId(view.id)}
                                  >
                                    <ViewIcon className="size-3 shrink-0" />
                                    <span className="flex-1 text-xs truncate">
                                      {view.descripcion}
                                    </span>
                                    {count > 0 && (
                                      <Badge
                                        size="sm"
                                        variant={isActive ? "default" : "outline"}
                                        className="text-[10px] shrink-0"
                                      >
                                        {count}
                                      </Badge>
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Permission detail panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedView ? (
            <>
              {/* View header */}
              <div className="p-4 border-b bg-card shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-base truncate">
                      {selectedView.descripcion}
                    </h2>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {selectedView.company && (
                        <Badge variant="outline" className="text-xs font-normal gap-1">
                          <Building2 className="size-3" />
                          {selectedView.company}
                        </Badge>
                      )}
                      {selectedView.padre && (
                        <Badge variant="outline" className="text-xs font-normal gap-1">
                          <FolderTree className="size-3" />
                          {selectedView.padre}
                        </Badge>
                      )}
                      {selectedView.route && (
                        <Badge
                          variant="outline"
                          className="text-xs font-mono font-normal"
                        >
                          {selectedView.route}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-sm font-normal">
                      {selectedPermissions[selectedView.id]?.size ?? 0} /{" "}
                      {selectedView.permissions?.length ?? 0}
                    </Badge>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => handleSelectAllView(selectedView.id)}
                      disabled={!selectedView.permissions?.length}
                    >
                      {(selectedPermissions[selectedView.id]?.size ?? 0) ===
                      selectedView.permissions?.length ? (
                        <>
                          <SquareX className="size-3 mr-1" />
                          Quitar todos
                        </>
                      ) : (
                        <>
                          <CheckSquare className="size-3 mr-1" />
                          Seleccionar todos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Permissions as compact pills */}
              <div className="flex-1 overflow-y-auto p-4">
                {!selectedView.permissions?.length ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                    <ShieldCheck className="size-10 opacity-30" />
                    <p className="text-sm">
                      Esta vista no tiene permisos disponibles
                    </p>
                  </div>
                ) : (
                  <TooltipProvider delayDuration={200}>
                    <div className="flex flex-wrap gap-2">
                      {selectedView.permissions.map((permission) => {
                        const isSelected = (
                          selectedPermissions[selectedView.id] ?? new Set()
                        ).has(permission.id);
                        const PermIcon = getIcon(permission.icon, ShieldCheck);

                        return (
                          <Tooltip key={permission.id}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() =>
                                  handleTogglePermission(
                                    selectedView.id,
                                    permission.id,
                                  )
                                }
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all select-none ${
                                  isSelected
                                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                    : "border-border bg-background hover:border-primary/60 hover:bg-muted"
                                }`}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  className="size-3 pointer-events-none"
                                  tabIndex={-1}
                                />
                                <PermIcon className="size-3" />
                                {permission.action_label}
                              </button>
                            </TooltipTrigger>
                            {permission.description && (
                              <TooltipContent
                                side="top"
                                className="max-w-48 text-center"
                              >
                                {permission.description}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <ShieldCheck className="size-12 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">Selecciona una vista</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  Elige una vista del panel izquierdo para configurar sus
                  permisos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync confirmation dialog */}
      <GeneralModal
        open={previewOpen}
        onClose={() => !isSaving && setPreviewOpen(false)}
        title="Confirmar sincronización"
        icon="ShieldCheck"
        size="lg"
        childrenFooter={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmSave} disabled={isSaving}>
              <ShieldCheck className="size-4 mr-1.5" />
              {isSaving ? "Guardando..." : "Confirmar"}
            </Button>
          </div>
        }
      >
        {previewData && (
          <div className="space-y-3 text-sm">
            {previewData.to_assign.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 font-medium text-green-600 mb-1.5">
                  <PlusCircle className="size-4" />
                  Se asignarán {previewData.to_assign.length} permiso{previewData.to_assign.length !== 1 ? "s" : ""}
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 pl-1">
                  {previewData.to_assign.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                      <span className="font-mono">{p.code}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewData.to_remove.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 font-medium text-destructive mb-1.5">
                  <MinusCircle className="size-4" />
                  Se eliminarán {previewData.to_remove.length} permiso{previewData.to_remove.length !== 1 ? "s" : ""}
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 pl-1">
                  {previewData.to_remove.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-1.5 rounded-full bg-destructive shrink-0" />
                      <span className="font-mono">{p.code}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {previewData.unchanged.length > 0 && (
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Minus className="size-4" />
                {previewData.unchanged.length} permiso{previewData.unchanged.length !== 1 ? "s" : ""} sin cambios
              </p>
            )}
          </div>
        )}
      </GeneralModal>
    </div>
  );
}
