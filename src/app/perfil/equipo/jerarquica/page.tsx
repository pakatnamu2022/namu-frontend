"use client";

import { useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import PageWrapper from "@/shared/components/PageWrapper";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import TeamHierarchyTree from "@/features/profile/team/components/hierarchy/TeamHierarchyTree";
import TeamHierarchyHistorySheet from "@/features/profile/team/components/hierarchy/TeamHierarchyHistorySheet";
import { WorkerHierarchyNode } from "@/features/profile/team/lib/team-hierarchy.interface";
import NoEvaluationMessage from "@/features/gp/gestionhumana/evaluaciondesempeño/evaluation-person/components/NoEvaluationMessage";

export default function TeamHierarchyPage() {
  const { user } = useAuthStore();
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(
    null,
  );

  if (!user) return <PageSkeleton />;

  if (!user.subordinates || user.subordinates <= 0) {
    return (
      <PageWrapper>
        <HeaderTableWrapper>
          <TitleComponent
            title="Jerarquía de Equipo"
            subtitle="Árbol genealógico de tu equipo"
            icon="Network"
            backRoute="/perfil/equipo"
          />
        </HeaderTableWrapper>
        <NoEvaluationMessage
          title="No tienes equipo a cargo"
          description="Esta vista solo está disponible para jefaturas con personal a su cargo."
          showSelector={false}
        />
      </PageWrapper>
    );
  }

  const root: WorkerHierarchyNode = {
    id: user.partner_id,
    name: user.name,
    position: user.position,
    photo: user.foto_adjunto,
    has_subordinates: user.subordinates > 0,
  };

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title="Jerarquía de Equipo"
          subtitle="Explora tu árbol genealógico y consulta el historial de cada persona"
          icon="Network"
          backRoute="/perfil/equipo"
        />
      </HeaderTableWrapper>

      <TeamHierarchyTree
        root={root}
        onConsult={setSelectedPersonId}
        className="shrink-0 h-[calc(100vh-14rem)] rounded-xl border bg-muted/20"
      />

      <TeamHierarchyHistorySheet
        personId={selectedPersonId}
        open={!!selectedPersonId}
        onClose={() => setSelectedPersonId(null)}
      />
    </PageWrapper>
  );
}
