"use client";

import TitleFormComponent from "@/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PermissionsForm from "@/features/gp/gestionsistema/permissions/components/PermissionsForm";
import NotFound from "@/app/not-found";
import { useParams, useSearchParams } from "react-router-dom";

export default function PermissionPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentView, checkRouteExists } = useCurrentModule();

  if (!id || isNaN(Number(id))) NotFound();
  if (!checkRouteExists("roles")) NotFound();
  if (!currentView) return <NotFound />;

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
