"use client";

import { useParams, useRouter } from "next/navigation";
import TitleComponent from "@/src/shared/components/TitleComponent";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { OpportunityForm } from "@/src/features/ap/comercial/oportunidades/components/OpportunityForm";
import {
  useOpportunity,
  useUpdateOpportunity,
} from "@/src/features/ap/comercial/oportunidades/lib/opportunities.hook";
import { OPPORTUNITIES } from "@/src/features/ap/comercial/oportunidades/lib/opportunities.constants";
import FormWrapper from "@/src/shared/components/FormWrapper";
import BackButton from "@/src/shared/components/BackButton";
import EmptyModel from "@/src/shared/components/EmptyModel";
import { AGENDA } from "@/src/features/ap/comercial/agenda/lib/agenda.constants";
import FormSkeleton from "@/src/shared/components/FormSkeleton";
import OpportunityClientCard from "@/src/features/ap/comercial/oportunidades/components/OpportunityClientCard";

const { ABSOLUTE_ROUTE } = OPPORTUNITIES;
const { ABSOLUTE_ROUTE: AGENDA_ABSOLUTE_ROUTE } = AGENDA;

export default function UpdateOpportunityPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = Number(params.id);

  const { data: opportunity, isLoading } = useOpportunity(opportunityId);
  const updateMutation = useUpdateOpportunity();

  const handleSubmit = (data: any) => {
    updateMutation.mutate(
      { id: opportunityId, data },
      {
        onSuccess: () => {
          router.push(`${ABSOLUTE_ROUTE}/${opportunityId}`);
        },
      }
    );
  };

  if (isLoading) return <FormSkeleton />;
  if (!opportunity) return <EmptyModel route={`${AGENDA_ABSOLUTE_ROUTE}`} />;

  return (
    <FormWrapper>
      <HeaderTableWrapper>
        <div className="flex items-center gap-4">
          <BackButton
            route={`${ABSOLUTE_ROUTE}/${opportunityId}`}
            name=""
            size="icon"
          />
          <TitleComponent
            title={`Oportunidad con ${opportunity.client.full_name}`}
            subtitle={
              opportunity.family.brand + " " + opportunity.family.description
            }
            icon="Target"
          />
        </div>
      </HeaderTableWrapper>

      <OpportunityClientCard data={opportunity.client} />

      <OpportunityForm
        defaultValues={{
          client_id: opportunity.client_id.toString(),
          family_id: opportunity.family_id.toString(),
          opportunity_type_id: opportunity.opportunity_type_id.toString(),
          client_status_id: opportunity.client_status_id.toString(),
          opportunity_status_id: opportunity.opportunity_status_id.toString(),
        }}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        mode="update"
        clientId={opportunity.client_id}
      />
    </FormWrapper>
  );
}
