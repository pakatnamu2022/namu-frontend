"use client";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useState, useEffect } from "react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { errorToast, successToast } from "@/core/core.function";
import { ShieldCheck, ArrowLeft, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/core/api";
import type { ViewResource } from "@/features/gp/gestionsistema/vistas/lib/view.interface";
import type { Permission } from "@/features/gp/gestionsistema/permissions/lib/permissions.interface";
import { VIEW } from "@/features/gp/gestionsistema/vistas/lib/view.constants";
import {
  bulkCreatePermissions,
  getAllPermissions,
} from "@/features/gp/gestionsistema/permissions/lib/permissions.actions";
import { PERMISSION_ACTIONS } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function ViewPermissionsPage() {
  const { id } = useParams();
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const [view, setView] = useState<ViewResource | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { ENDPOINT, ABSOLUTE_ROUTE } = VIEW;

  useEffect(() => {
    const fetchData = async () => {
      if (!id || isNaN(Number(id))) notFound();

      try {
        setIsLoading(true);

        const { data: viewData } = await api.get<ViewResource>(`${ENDPOINT}/${id}`);
        setView(viewData);

        const permissions = await getAllPermissions({ vista_id: Number(id), all: true });
        setExistingPermissions(permissions);

        if (permissions.length > 0) {
          setSelectedActions(permissions.map((p) => p.policy_method));
          setIsActive(permissions[0].is_active);
        }
      } catch (error: any) {
        errorToast("Error al cargar los datos", error.response.data?.message?.toString());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleToggleAction = (actionValue: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionValue)
        ? prev.filter((val) => val !== actionValue)
        : [...prev, actionValue],
    );
  };

  const handleSelectAll = () => {
    if (selectedActions.length === PERMISSION_ACTIONS.length) {
      setSelectedActions([]);
    } else {
      setSelectedActions(PERMISSION_ACTIONS.map((a) => a.value));
    }
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
      errorToast("Error al sincronizar permisos", error.response.data?.message?.toString());
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => router(ABSOLUTE_ROUTE!);

  if (!checkRouteExists("vistas")) notFound();
  if (!currentView) notFound();
  if (isLoading) return <FormSkeleton />;
  if (!view) notFound();

  return (
    <div className="max-w-4xl w-full mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel} className="shrink-0">
          <ArrowLeft className="size-5" />
        </Button>
        <TitleFormComponent
          title={`Permisos de Vista: ${view.descripcion}`}
          mode="edit"
          icon="ShieldCheck"
        />
      </div>

      {/* Vista info + estado en una sola tarjeta */}
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
              <Label htmlFor="is-active" className="text-sm cursor-pointer select-none">
                {isActive ? "Activos" : "Inactivos"}
              </Label>
              <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selección de acciones */}
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
                      <button
                        onClick={() => handleToggleAction(action.value)}
                        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all select-none ${
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
                        {action.label}
                        {existsInCurrent && (
                          <span className="size-1.5 rounded-full bg-current opacity-60 ml-0.5" />
                        )}
                      </button>
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

      <Separator />

      <div className="flex items-center pb-6 justify-end gap-4">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isSaving || selectedActions.length === 0}>
          <ShieldCheck className="size-4 mr-2" />
          {isSaving ? "Sincronizando..." : "Sincronizar Permisos"}
        </Button>
      </div>
    </div>
  );
}
