"use client";

import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PermissionsForm from "@/features/gp/gestionsistema/permissions/components/PermissionsForm";
import { notFound } from "@/shared/hooks/useNotFound";
import { useParams, useSearchParams } from "react-router-dom";

export default function PermissionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentView, checkRouteExists } = useCurrentModule();

  if (!id || isNaN(Number(id))) notFound();
  if (!checkRouteExists("roles")) notFound();
  if (!currentView) notFound();

  const roleName = searchParams.get("nombre") || "Sin nombre";

  return (
    <div className="max-w-(--breakpoint-xl) w-full mx-auto">
      <TitleFormComponent
        title={`Permisos del rol ${roleName}`}
        mode="edit"
        icon={"KeyRound"}
      />
      <PermissionsForm id={Number(id)} />
    </div>
  );
}
