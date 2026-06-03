"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldCheck, Info } from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import { api } from "@/core/api";
import GeneralSheet from "@/shared/components/GeneralSheet";
import type { ViewResource } from "../lib/view.interface";
import type { Permission } from "@/features/gp/gestionsistema/permissions/lib/permissions.interface";
import { VIEW } from "../lib/view.constants";
import { bulkCreatePermissions, getAllPermissions } from "@/features/gp/gestionsistema/permissions/lib/permissions.actions";
import { PERMISSION_ACTIONS } from "@/shared/hooks/useModulePermissions";

interface Props {
  viewId: number | null;
  open: boolean;
  onClose: () => void;
}

export default function ViewPermissionsSheet({ viewId, open, onClose }: Props) {
  const { ENDPOINT } = VIEW;
  const [view, setView] = useState<ViewResource | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open || !viewId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: viewData } = await api.get<ViewResource>(`${ENDPOINT}/${viewId}`);
        setView(viewData);

        const permissions = await getAllPermissions({ vista_id: viewId, all: true });
        setExistingPermissions(permissions);

        if (permissions.length > 0) {
          setSelectedActions(permissions.map((p) => p.policy_method));
          setIsActive(permissions[0].is_active);
        } else {
          setSelectedActions([]);
          setIsActive(true);
        }
      } catch (error: any) {
        errorToast("Error al cargar los datos", error.response?.data?.message?.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, viewId]);

  const handleToggleAction = (actionValue: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionValue)
        ? prev.filter((val) => val !== actionValue)
        : [...prev, actionValue],
    );
  };

  const handleSelectAll = () => {
    setSelectedActions(
      selectedActions.length === PERMISSION_ACTIONS.length
        ? []
        : PERMISSION_ACTIONS.map((a) => a.value),
    );
  };

  const handleSave = async () => {
    if (!view) return;

    if (selectedActions.length === 0) {
      errorToast("Selecciona al menos una acción");
      return;
    }

    setIsSaving(true);
    try {
      await bulkCreatePermissions({
        vista_id: view.id,
        module: view.route,
        module_name: view.descripcion,
        actions: selectedActions,
        is_active: isActive,
      });
      successToast(`Permisos sincronizados correctamente para "${view.descripcion}"`);
    } catch (error: any) {
      errorToast("Error al sincronizar permisos", error.response?.data?.message?.toString());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GeneralSheet
      open={open}
      onClose={onClose}
      title={view ? `Permisos: ${view.descripcion}` : "Gestionar Permisos"}
      icon="ShieldCheck"
      size="3xl"
      isLoading={isLoading}
      childrenFooter={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedActions.length === 0}>
            <ShieldCheck className="size-4 mr-2" />
            {isSaving ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Vista info */}
        {view && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Slug:</span>
                    <Badge>{view.slug}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Ruta:</span>
                    <Badge variant="outline">{view.route || view.ruta}</Badge>
                  </div>
                  {view.parent && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Padre:</span>
                      <span className="font-medium">{view.parent}</span>
                    </div>
                  )}
                  {view.company && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">Empresa:</span>
                      <span className="font-medium capitalize">{view.company}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="sheet-is-active" className="text-sm cursor-pointer select-none">
                    {isActive ? "Activos" : "Inactivos"}
                  </Label>
                  <Switch id="sheet-is-active" checked={isActive} onCheckedChange={setIsActive} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Acciones</CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {selectedActions.length} / {PERMISSION_ACTIONS.length}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedActions.length === PERMISSION_ACTIONS.length
                  ? "Deseleccionar todas"
                  : "Seleccionar todas"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TooltipProvider delayDuration={200}>
              <div className="flex flex-wrap gap-2">
                {PERMISSION_ACTIONS.map((action) => {
                  const isSelected = selectedActions.includes(action.value);
                  const existsInCurrent = existingPermissions.some(
                    (perm) => perm.policy_method === action.value,
                  );

                  return (
                    <Tooltip key={action.value}>
                      <TooltipTrigger asChild>
                        <div
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleToggleAction(action.value)}
                          onKeyDown={(e) => e.key === " " || e.key === "Enter" ? handleToggleAction(action.value) : undefined}
                          className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all select-none cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-sm"
                              : "border-border bg-background hover:border-primary/60 hover:bg-muted"
                          }`}
                        >
                          <span
                            className={`size-3 rounded-sm border shrink-0 flex items-center justify-center ${
                              isSelected
                                ? "border-primary-foreground bg-primary-foreground/20"
                                : "border-current opacity-50"
                            }`}
                          >
                            {isSelected && (
                              <svg viewBox="0 0 10 8" className="size-2 fill-current">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </span>
                          {action.label}
                          {existsInCurrent && (
                            <span className="size-1.5 rounded-full bg-current opacity-60 ml-0.5" />
                          )}
                        </div>
                      </TooltipTrigger>
                      {action.description && (
                        <TooltipContent side="top" className="max-w-48 text-center">
                          {action.description}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Info className="size-3 shrink-0" />
              Al sincronizar se reemplazarán todos los permisos existentes de esta vista.
            </p>
          </CardContent>
        </Card>
      </div>
    </GeneralSheet>
  );
}
