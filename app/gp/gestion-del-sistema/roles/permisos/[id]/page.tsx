"use client";

import { notFound, useParams, useSearchParams } from "next/navigation";
import TitleFormComponent from "@/src/shared/components/TitleFormComponent";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import PermissionsForm from "@/src/features/gp/gestionsistema/permissions/components/PermissionsForm";

export default function PermissionPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
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
