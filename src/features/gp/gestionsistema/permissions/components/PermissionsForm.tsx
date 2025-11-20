"use client";

import { useState, useMemo, useEffect } from "react";
import { PermissionsActions } from "./PermissionsActions";
import { useNavigate } from "react-router-dom";
import { successToast, errorToast } from "@/core/core.function";
import { api } from "@/core/api";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  CheckSquare,
  SquareX,
  Search,
  ShieldCheck,
  Layers,
  Building2,
  FolderTree,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useAllViewPermission } from "@/features/gp/gestionsistema/vistas/lib/view.hook";
import * as LucideIcons from "lucide-react";
// import DataTablePagination from "@/shared/components/DataTablePagination";
import { ROLE } from "../../roles/lib/role.constants";

export default function PermissionsForm({ id }: { id: number }) {
  const { ABSOLUTE_ROUTE } = ROLE;
  const router = useNavigate();

  // State for search and pagination
  const [searchInput, setSearchInput] = useState(""); // Input value (immediate)
  const [searchTerm, setSearchTerm] = useState(""); // Debounced value (delayed)
  const [currentPage, setCurrentPage] = useState(1);
  // const [perPage, setPerPage] = useState(10);

  // State for expanded views (to show/hide permissions)
  const [expandedViews, setExpandedViews] = useState<Set<number>>(new Set());

  // State for selected permissions: { viewId: Set<permissionId> }
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<number, Set<number>>
  >({});

  // State for saving
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search input (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch all views with their permissions using the hook with search and pagination
  const {
    data: viewsData,
    isLoading,
    refetch,
  } = useAllViewPermission({
    search: searchTerm,
    // per_page: perPage,
    page: currentPage,
    rol_id: id,
    all: 1,
  });

  const handleCancel = () => {
    router(ABSOLUTE_ROUTE);
  };

  // Get all views from the response
  const allViews = useMemo(() => {
    if (!viewsData) return [];
    return viewsData;
  }, [viewsData]);

  // Initialize selected permissions from is_assigned
  useEffect(() => {
    if (!viewsData) return;

    const initialSelected: Record<number, Set<number>> = {};

    viewsData.forEach((view) => {
      const assignedPermissions =
        view.permissions
          ?.filter((p) => p.is_assigned === true)
          .map((p) => p.id) || [];

      if (assignedPermissions.length > 0) {
        initialSelected[view.id] = new Set(assignedPermissions);
      }
    });

    setSelectedPermissions(initialSelected);
  }, [viewsData]);

  // Pagination data
  // const pagination = useMemo(() => {
  //   if (!viewsData) return null;
  //   return {
  //     currentPage: viewsData.current_page,
  //     lastPage: viewsData.last_page,
  //     from: viewsData.from,
  //     to: viewsData.to,
  //     total: viewsData.total,
  //     perPage: viewsData.per_page,
  //   };
  // }, [viewsData]);

  // Toggle view expansion
  const handleToggleExpand = (viewId: number) => {
    setExpandedViews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(viewId)) {
        newSet.delete(viewId);
      } else {
        newSet.add(viewId);
      }
      return newSet;
    });
  };

  // Toggle individual permission selection
  const handleTogglePermission = (viewId: number, permissionId: number) => {
    setSelectedPermissions((prev) => {
      const viewPermissions = prev[viewId] || new Set<number>();
      const newSet = new Set(viewPermissions);

      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }

      return {
        ...prev,
        [viewId]: newSet,
      };
    });
  };

  // Select all permissions for a view
  const handleSelectAllViewPermissions = (viewId: number) => {
    const view = allViews.find((v) => v.id === viewId);
    if (!view || !view.permissions) return;

    setSelectedPermissions((prev) => {
      const currentPermissions = prev[viewId] || new Set<number>();
      const allPermissionIds = view.permissions.map((p) => p.id);

      // If all are selected, deselect all; otherwise, select all
      const allSelected = allPermissionIds.every((id) =>
        currentPermissions.has(id)
      );

      return {
        ...prev,
        [viewId]: allSelected ? new Set<number>() : new Set(allPermissionIds),
      };
    });
  };

  // Select all permissions from all loaded views
  const handleSelectAllPermissions = () => {
    const newSelectedPermissions: Record<number, Set<number>> = {};

    // Check if all permissions are already selected
    const allPermissionsSelected = allViews.every((view) => {
      const viewPermissions = view.permissions || [];
      const selectedPerms = selectedPermissions[view.id] || new Set();
      return (
        viewPermissions.length > 0 &&
        viewPermissions.every((p) => selectedPerms.has(p.id))
      );
    });

    if (allPermissionsSelected) {
      // If all are selected, deselect all
      setSelectedPermissions({});
    } else {
      // Otherwise, select all permissions from all views
      allViews.forEach((view) => {
        const viewPermissions = view.permissions || [];
        if (viewPermissions.length > 0) {
          newSelectedPermissions[view.id] = new Set(
            viewPermissions.map((p) => p.id)
          );
        }
      });
      setSelectedPermissions(newSelectedPermissions);
    }
  };

  const handleSavePermissions = async () => {
    // Collect all selected permission IDs
    const allPermissionIds: number[] = [];
    Object.values(selectedPermissions).forEach((permSet) => {
      permSet.forEach((permId) => {
        allPermissionIds.push(permId);
      });
    });

    if (allPermissionIds.length === 0) {
      errorToast("Selecciona al menos un permiso para guardar");
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/configuration/permission/save-permissions-to-role", {
        role_id: id,
        permissions: allPermissionIds,
      });

      successToast("Permisos sincronizados correctamente");
    } catch (error) {
      errorToast("Error al sincronizar permisos. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Remove permission from role
  const handleRemovePermission = async (permissionId: number) => {
    try {
      await api.delete(
        "/configuration/permission/remove-permission-from-role",
        {
          data: {
            role_id: id,
            permission_id: permissionId,
          },
        }
      );

      successToast("Permiso eliminado correctamente");

      // Actualizar el estado local para reflejar el cambio
      setSelectedPermissions((prev) => {
        const newState = { ...prev };
        Object.keys(newState).forEach((viewId) => {
          newState[Number(viewId)].delete(permissionId);
        });
        return newState;
      });

      // Refetch data to update UI
      await refetch();
    } catch (error) {
      errorToast("Error al eliminar el permiso");
    }
  };

  // Get icon component
  const getIconComponent = (iconName: string | null | undefined) => {
    if (!iconName) return Layers;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || Layers;
  };

  // Get permission icon from permission.icon field
  const getPermissionIcon = (iconName: string | null | undefined) => {
    if (!iconName) return ShieldCheck;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || ShieldCheck;
  };

  // Handle pagination
  // const handlePageChange = (newPage: number) => {
  //   setCurrentPage(newPage);
  // };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <CardContent className="space-y-4 pt-6">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por vista..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 text-base"
            />
          </div>
            <Button
            variant="default"
            size="lg"
            onClick={handleSelectAllPermissions}
            disabled={isLoading || allViews.length === 0}
            >
            {Object.keys(selectedPermissions).length === allViews.length &&
            allViews.every((view) => {
              const viewPermissions = view.permissions || [];
              const selectedPerms = selectedPermissions[view.id] || new Set();
              return (
              viewPermissions.length > 0 &&
              viewPermissions.every((p) => selectedPerms.has(p.id))
              );
            }) ? (
              <CheckCheck className="size-4 mr-2" />
            ) : (
              <CheckSquare className="size-4 mr-2" />
            )}
            Seleccionar Todo
            </Button>
          <PermissionsActions
            onCancel={handleCancel}
            onSave={handleSavePermissions}
            isSaving={isSaving}
          />
        </div>

        {/* Views list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-16 border rounded-xl bg-muted/10">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                <div>
                  <p className="text-base font-medium text-muted-foreground">
                    Cargando vistas y permisos...
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Por favor espera un momento
                  </p>
                </div>
              </div>
            </div>
          ) : allViews.length === 0 ? (
            <div className="text-center py-12 border rounded-xl">
              <Search className="size-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                No se encontraron vistas
              </p>
            </div>
          ) : (
            allViews.map((view) => {
              const isExpanded = expandedViews.has(view.id);
              const ViewIcon = getIconComponent(view.icon);
              const viewPermissions = view.permissions || [];
              const selectedPerms = selectedPermissions[view.id] || new Set();
              const allSelected =
                viewPermissions.length > 0 &&
                viewPermissions.every((p) => selectedPerms.has(p.id));

              return (
                <div
                  key={view.id}
                  className="border rounded-xl bg-card hover:shadow-md transition-all"
                >
                  {/* View Header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                          <ViewIcon className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-2">
                            <h3 className="font-semibold text-base truncate">
                              {view.descripcion}
                            </h3>
                            <Badge
                              size="sm"
                              variant={
                                viewPermissions.length > 0
                                  ? "outline"
                                  : "default"
                              }
                            >
                              {viewPermissions.length} permiso
                              {viewPermissions.length !== 1 ? "s" : ""}
                            </Badge>
                            {selectedPerms.size > 0 && (
                              <Badge size="sm">
                                {selectedPerms.size} seleccionado
                                {selectedPerms.size !== 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>

                          {/* Jerarquía de módulos */}
                          {(view.company ||
                            view.padre ||
                            view.subPadre ||
                            view.hijo) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 mb-1">
                              {view.company && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                  <Building2 className="size-3" />
                                  <span>{view.company}</span>
                                </div>
                              )}
                              {view.padre && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">
                                  <FolderTree className="size-3" />
                                  <span>{view.padre}</span>
                                </div>
                              )}
                              {view.subPadre && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded">
                                  <FolderTree className="size-3" />
                                  <span>{view.subPadre}</span>
                                </div>
                              )}
                              {view.hijo && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded">
                                  <Layers className="size-3" />
                                  <span>{view.hijo}</span>
                                </div>
                              )}

                              {view.route && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                                  <span className="font-mono">
                                    {view.route}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4 justify-between h-full">
                        {/* Action Buttons */}
                        {viewPermissions.length > 0 && (
                          <>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleToggleExpand(view.id)}
                              className="gap-2"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="size-4" />
                                  Ocultar Permisos
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="size-4" />
                                  Ver Permisos
                                </>
                              )}
                            </Button>
                            <Button
                              variant={allSelected ? "secondary" : "default"}
                              size="xs"
                              onClick={() =>
                                handleSelectAllViewPermissions(view.id)
                              }
                              className="gap-2"
                            >
                              {allSelected ? (
                                <SquareX className="size-4" />
                              ) : (
                                <CheckSquare className="size-4" />
                              )}
                              Todos
                            </Button>
                          </>
                        )}
                        {viewPermissions.length === 0 && (
                          <p className="text-sm text-muted-foreground italic">
                            Esta vista no tiene permisos disponibles
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Permissions */}
                  {isExpanded && viewPermissions.length > 0 && (
                    <div className="border-t-2 bg-muted/20 p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {viewPermissions.map((permission) => {
                          const isSelected = selectedPerms.has(permission.id);
                          const PermIcon = getPermissionIcon(permission.icon);
                          const isAssigned = permission.is_assigned === true;

                          return (
                            <div
                              key={permission.id}
                              className={`relative flex items-start gap-3 p-3 border rounded-lg transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-sm"
                                  : "border-border bg-card hover:border-primary/50"
                              }`}
                            >
                              {/* Botón eliminar - solo visible si está asignado */}
                              {isAssigned && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute top-1 right-1 h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePermission(permission.id);
                                  }}
                                  title="Eliminar permiso"
                                >
                                  <Trash2 className="size-3" />
                                </Button>
                              )}

                              <div
                                className="flex items-start gap-3 flex-1 cursor-pointer"
                                onClick={() =>
                                  handleTogglePermission(view.id, permission.id)
                                }
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() =>
                                    handleTogglePermission(
                                      view.id,
                                      permission.id
                                    )
                                  }
                                  className="mt-0.5"
                                />
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`p-1 rounded-md ${
                                        isSelected
                                          ? "bg-primary/20 text-primary"
                                          : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      <PermIcon className="size-3" />
                                    </div>
                                    <p className="font-semibold text-sm leading-tight">
                                      {permission.action_label}
                                    </p>
                                  </div>
                                  {permission.description && (
                                    <p className="text-[10px] text-muted-foreground leading-snug">
                                      {permission.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {/* {pagination && pagination.lastPage > 1 && (
          <DataTablePagination
            page={currentPage}
            totalPages={pagination.lastPage}
            onPageChange={handlePageChange}
            per_page={perPage}
            setPerPage={setPerPage}
            totalData={pagination.total}
          />
        )} */}
      </CardContent>
    </div>
  );
}
