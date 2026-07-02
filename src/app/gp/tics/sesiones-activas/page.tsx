"use client";

import { useMemo, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { ACTIVE_SESSIONS } from "@/features/gp/tics/sesiones-activas/lib/activeSessions.constants";
import { useActiveSessions } from "@/features/gp/tics/sesiones-activas/lib/activeSessions.hook";
import ActiveSessionsSummary from "@/features/gp/tics/sesiones-activas/components/ActiveSessionsSummary";
import ActiveSessionsTable from "@/features/gp/tics/sesiones-activas/components/ActiveSessionsTable";
import ActiveSessionsOptions from "@/features/gp/tics/sesiones-activas/components/ActiveSessionsOptions";
import { activeSessionsColumns } from "@/features/gp/tics/sesiones-activas/components/ActiveSessionsColumns";

export default function ActiveSessionsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [search, setSearch] = useState("");
  const { ROUTE } = ACTIVE_SESSIONS;

  const { data, isLoading } = useActiveSessions();

  const users = useMemo(() => {
    const all = data?.users ?? [];
    if (!search.trim()) return all;
    const term = search.trim().toLowerCase();
    return all.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term),
    );
  }, [data?.users, search]);

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle="Usuarios con sesión activa hoy"
          icon={currentView.icon}
        />
      </HeaderTableWrapper>

      <ActiveSessionsSummary
        total={data?.total ?? 0}
        online={data?.online ?? 0}
        isLoading={isLoading}
      />

      <ActiveSessionsTable
        isLoading={isLoading}
        columns={activeSessionsColumns()}
        data={users}
      >
        <ActiveSessionsOptions search={search} setSearch={setSearch} />
      </ActiveSessionsTable>
    </div>
  );
}
