"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useState, useEffect } from "react";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { errorToast, successToast } from "@/core/core.function";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/core/api";
import type { ViewResource } from "@/features/gp/gestionsistema/vistas/lib/view.interface";
import type { Permission } from "@/features/gp/gestionsistema/permissions/lib/permissions.interface";
import { VIEW } from "@/features/gp/gestionsistema/vistas/lib/view.constants";
import {
  bulkCreatePermissions,
  getAllPermissions,
} from "@/features/gp/gestionsistema/permissions/lib/permissions.actions";
import { PERMISSION_ACTIONS } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function ViewPermissionsPage() {
    const { id } = useParams();
  const router = useNavigate();
  const { currentView, checkRouteExists } = useCurrentModule();

  const [view, setView] = useState<ViewResource | null>(null);
  const [existingPermissions, setExistingPermissions] = useState<Permission[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { ENDPOINT } = VIEW;

  // Fetch view data and existing permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!id || isNaN(Number(id))) {
        notFound();
        return;
      }

      try {
        setIsLoading(true);

        // Fetch view data
        const { data: viewData } = await api.get<ViewResource>(
          `${ENDPOINT}/${id}`
        );
        setView(viewData);

        // Fetch existing permissions for this view
        const permissions = await getAllPermissions({
          vista_id: Number(id),
          all: true,
        });
        setExistingPermissions(permissions);

        // Pre-select actions based on existing permissions
        if (permissions.length > 0) {
          const existingActions = permissions.map((p) => p.policy_method);
          setSelectedActions(existingActions);

          // Set isActive based on first permission (assuming all have same status)
          setIsActive(permissions[0].is_active);
        }
      } catch (error) {
        errorToast("Error al cargar los datos");
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
        : [...prev, actionValue]
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

    console.log("Selected Actions antes de enviar:", selectedActions);
    console.log("PERMISSION_ACTIONS values:", PERMISSION_ACTIONS.map(a => a.value));

    setIsSaving(true);
    try {
      const payload = {
        vista_id: view.id,
        module: view.route,
        module_name: view.descripcion,
        actions: selectedActions,
        is_active: isActive,
      };
      console.log("Payload a enviar:", JSON.stringify(payload, null, 2));

      await bulkCreatePermissions(payload);

      successToast(
        `Permisos sincronizados correctamente para "${view.descripcion}"`
      );
    } catch (error) {
      errorToast("Error al sincronizar permisos");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router("../");
  };

  if (!checkRouteExists("vistas")) return <NotFound />;
  if (!currentView) return <NotFound />;
  if (isLoading) return <FormSkeleton />;
  if (!view) return <NotFound />;

  // Map policy_method to action value for comparison
  const getActionFromPolicyMethod = (policyMethod: string): string => {
    // This function is NOT used for sending data to backend
    // It's only used to match backend policy_method values with frontend PERMISSION_ACTIONS
    // Backend uses snake_case (view_advisors), frontend uses the same in PERMISSION_ACTIONS
    return policyMethod;
  };

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <TitleFormComponent
          title={`Permisos de Vista: ${view.descripcion}`}
          mode="edit"
          icon="ShieldCheck"
        />
      </div>

      {/* View Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Información de la Vista
          </CardTitle>
          <CardDescription>
            Detalles de la vista para la cual configurarás los permisos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Slug</span>
              <div className="font-semibold">
                <Badge>{view.slug}</Badge>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Ruta</span>
              <div className="font-semibold">
                <Badge variant="secondary">{view.route || view.ruta}</Badge>
              </div>
            </div>
            {view.parent && (
              <div>
                <span className="text-sm text-muted-foreground">
                  Módulo Padre
                </span>
                <p className="font-semibold">{view.parent}</p>
              </div>
            )}
            {view.company && (
              <div>
                <span className="text-sm text-muted-foreground">Empresa</span>
                <p className="font-semibold capitalize">{view.company}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Permisos</CardTitle>
          <CardDescription>
            Define si los permisos estarán activos o inactivos después de
            sincronizar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div>
              <Label htmlFor="is-active" className="font-semibold text-base">
                {isActive ? "Permisos Activos" : "Permisos Inactivos"}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Los permisos sincronizados estarán{" "}
                <strong>{isActive ? "activos" : "inactivos"}</strong> en el
                sistema
              </p>
            </div>
            <Switch
              id="is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
              className="scale-125"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Seleccionar Acciones</CardTitle>
              <CardDescription>
                Selecciona las acciones que deseas sincronizar para esta vista
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedActions.length === PERMISSION_ACTIONS.length
                ? "Deseleccionar todas"
                : "Seleccionar todas"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="secondary" className="text-sm">
            {selectedActions.length} de {PERMISSION_ACTIONS.length} acción(es)
            seleccionada(s)
          </Badge>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PERMISSION_ACTIONS.map((action) => {
              const isSelected = selectedActions.includes(action.value);

              // Check if this action exists in current permissions
              const existsInCurrent = existingPermissions.some(
                (perm) =>
                  getActionFromPolicyMethod(perm.policy_method) === action.value
              );

              return (
                <div
                  key={action.value}
                  className={`relative flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleToggleAction(action.value)}
                >
                  {existsInCurrent && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0"
                      >
                        Actual
                      </Badge>
                    </div>
                  )}
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleToggleAction(action.value)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-sm leading-tight">
                      {action.label}
                    </p>
                    {action.description && (
                      <p className="text-xs text-muted-foreground leading-snug">
                        {action.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <ShieldCheck className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                Importante: Sincronización de Permisos
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Al sincronizar, se{" "}
                <strong>reemplazarán todos los permisos existentes</strong> de
                esta vista con las acciones seleccionadas. Las acciones no
                seleccionadas serán <strong>eliminadas del sistema</strong>.
                Esta operación sincroniza el estado actual con el servidor.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Footer Actions */}
      <div className="flex items-center pb-6 justify-end gap-4">
        <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || selectedActions.length === 0}
        >
          <ShieldCheck className="size-4 mr-2" />
          {isSaving ? "Sincronizando..." : "Sincronizar Permisos"}
        </Button>
      </div>
    </div>
  );
}
