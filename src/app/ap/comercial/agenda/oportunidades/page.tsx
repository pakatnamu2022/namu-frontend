"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import {
  useMyOpportunities,
  useUpdateOpportunity,
  useOpportunityStatuses,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import { useMyLeads } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.hook";
import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/shared/components/kanban";
import type { DragEndEvent } from "@/shared/components/kanban";
import { OpportunityCard } from "@/features/ap/comercial/oportunidades/components/OpportunityCard";
import { LeadCard } from "@/features/ap/comercial/oportunidades/components/LeadCard";
import {
  OPPORTUNITIES_COLUMNS,
  OPPORTUNITY_VENDIDA,
  OPPORTUNITY_CERRADA,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ERROR_MESSAGE,
  errorToast,
  successToast,
} from "@/core/core.function";
import { cn } from "@/lib/utils";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import OpportunityActions from "@/features/ap/comercial/oportunidades/components/OpportunityActions";
import { discardLead } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.actions";
import { MANAGE_LEADS } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.constants";
import { useInvalidateQuery } from "@/core/core.hook";
import { useCommercialFiltersStore } from "@/features/ap/comercial/lib/commercial.store";
import { useAllWorkers } from "@/features/gp/gestionhumana/personal/trabajadores/lib/worker.hook";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  POSITION_TYPE,
  STATUS_WORKER,
} from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from "@/app/not-found";


export default function OpportunitiesKanbanPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = AGENDA;
  const { QUERY_KEY, MODEL } = MANAGE_LEADS;
  const { selectedAdvisorId, setSelectedAdvisorId } =
    useCommercialFiltersStore();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [searchTerm, setSearchTerm] = useState("");
  const permissions = useModulePermissions(ROUTE);

  // Check if user has permission to view all users' opportunities
  const canViewAdvisors = permissions.canViewAdvisors || false;

  // Load advisors only if user has permission
  const { data: workers = [], isLoading: isLoadingWorkers } = useAllWorkers({
    cargo_id: POSITION_TYPE.CONSULTANT,
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
  });

  // Build query params based on permission
  const opportunitiesParams =
    canViewAdvisors && selectedAdvisorId
      ? { worker_id: selectedAdvisorId }
      : {};

  const { data: opportunities = [], isLoading } =
    useMyOpportunities(opportunitiesParams);
  const { data: statusesData } = useOpportunityStatuses();
  const updateMutation = useUpdateOpportunity();

  // Get validated leads (potential buyers)
  const { data: validatedLeads = [], isLoading: isLoadingLeads } = useMyLeads({
    worker_id: canViewAdvisors ? selectedAdvisorId : undefined,
  });

  const statuses = statusesData?.data || [];

  // Only 4 columns: TEMPLADA, CALIENTE, GANADA, PERDIDA
  const columns = OPPORTUNITIES_COLUMNS;

  // Transform opportunities to kanban items
  const kanbanData = opportunities.map((opp) => ({
    id: opp.id.toString(),
    name: opp.family.description,
    column: opp.opportunity_status,
    opportunity: opp,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const opportunity = opportunities.find(
      (o) => o.id.toString() === active.id
    );
    if (!opportunity) return;

    // Determinar si se movió a una columna o a otra tarjeta
    let targetColumnId = over.id as string;

    // Si se soltó sobre otra tarjeta, encontrar su columna
    const overOpportunity = opportunities.find(
      (o) => o.id.toString() === over.id
    );
    if (overOpportunity) {
      targetColumnId = overOpportunity.opportunity_status;
    }

    // Si no cambió de columna, no hacer nada
    if (opportunity.opportunity_status === targetColumnId) {
      return;
    }

    // Check if opportunity is closed (VENDIDA/CERRADA)
    if (
      opportunity.opportunity_status === OPPORTUNITY_VENDIDA ||
      opportunity.opportunity_status === OPPORTUNITY_CERRADA
    ) {
      errorToast("No se pueden mover oportunidades que están Vendidas o Cerradas");
      invalidateQuery([QUERY_KEY, "my"]); // Revertir UI
      return;
    }

    const targetColumn = columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) {
      invalidateQuery([QUERY_KEY, "my"]); // Revertir UI
      return;
    }

    // PREVENIR el movimiento si la columna no es editable
    if (!targetColumn.canEdit) {
      errorToast("No se puede mover a esta columna directamente");
      invalidateQuery([QUERY_KEY, "my"]); // Revertir UI
      return;
    }

    // Get the status ID from statuses - mapeo de columnas a códigos de API
    const columnToCode: Record<string, string> = {
      FRIO: "COLD",
      TEMPLADA: "WARM",
      CALIENTE: "HOT",
      VENDIDA: "SOLD",
      PERDIDA: "LOST",
    };

    const statusCode = columnToCode[targetColumn.id];
    const newStatus = statuses.find((s) => s.code === statusCode);

    if (!newStatus) {
      invalidateQuery([QUERY_KEY, "my"]); // Revertir UI
      return;
    }

    // Update opportunity status
    updateMutation.mutate(
      {
        id: opportunity.id,
        data: {
          opportunity_status_id: newStatus.id.toString(),
        },
      },
      {
        onSuccess: () => {
          invalidateQuery([QUERY_KEY, "my"]);
        },
        onError: () => {
          invalidateQuery([QUERY_KEY, "my"]);
        },
      }
    );
  };

  const invalidateQuery = useInvalidateQuery();

  // Enable horizontal scroll with mouse wheel using Embla API
  useEffect(() => {
    if (!carouselApi) return;

    const emblaRoot = carouselApi.rootNode();
    if (!emblaRoot) return;

    const handleWheel = (e: WheelEvent) => {
      // Only handle vertical scroll (deltaY)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        // Scroll the carousel based on wheel direction
        const scrollAmount = e.deltaY > 0 ? 1 : -1;
        carouselApi.scrollTo(carouselApi.selectedScrollSnap() + scrollAmount);
      }
    };

    emblaRoot.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      emblaRoot.removeEventListener("wheel", handleWheel);
    };
  }, [carouselApi]);

  // Filter leads based on search term
  const filteredLeads = validatedLeads.filter((lead) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      lead.full_name?.toLowerCase().includes(searchLower) ||
      lead.phone?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.num_doc?.toLowerCase().includes(searchLower) ||
      lead.model?.toLowerCase().includes(searchLower) ||
      lead.campaign?.toLowerCase().includes(searchLower)
    );
  });

  const handleDiscardLead = (
    leadId: number,
    comment: string,
    reasonDiscardingId: number
  ) => {
    discardLead(leadId, comment, reasonDiscardingId)
      .then(() => {
        successToast("Lead descartado exitosamente");
        invalidateQuery([QUERY_KEY, "my"]);
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "update"));
      });
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4 h-screen flex flex-col">
      <HeaderTableWrapper>
        <TitleComponent
          title="Tablero de Oportunidades"
          subtitle="Gestiona tus oportunidades arrastrando y soltando"
          icon="Target"
        />

        <div className="flex items-center gap-2">
          <OpportunityActions
            canViewAllUsers={canViewAdvisors}
            selectedAdvisorId={selectedAdvisorId}
            setSelectedAdvisorId={setSelectedAdvisorId}
            workers={workers}
          />
        </div>
      </HeaderTableWrapper>

      {isLoading || isLoadingLeads || isLoadingWorkers ? (
        <FormSkeleton />
      ) : (
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Leads Carousel */}
          {validatedLeads.length > 0 && (
            <div className="p-2 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-tertiary">
                    Leads Validados
                  </h3>
                  <Badge className="text-xs h-5">{filteredLeads.length}</Badge>
                  {searchTerm && (
                    <span className="text-xs text-muted-foreground">
                      de {validatedLeads.length}
                    </span>
                  )}
                </div>

                <Input
                  type="text"
                  placeholder="Buscar lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs h-8 text-sm"
                />
              </div>

              <Carousel
                opts={{
                  align: "start",
                  loop: false,
                  dragFree: true,
                }}
                setApi={setCarouselApi}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {filteredLeads.map((lead) => (
                    <CarouselItem key={lead.id} className="pl-2 basis-auto">
                      <div className="w-72">
                        <LeadCard lead={lead} onDiscard={handleDiscardLead} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
              </Carousel>

              {filteredLeads.length === 0 && searchTerm && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No se encontraron leads que coincidan con "{searchTerm}"
                </div>
              )}
            </div>
          )}

          {/* Kanban Boards */}
          <div className="flex-1 overflow-hidden overflow-x-auto lg:overflow-x-hidden">
            <KanbanProvider
              columns={columns}
              data={kanbanData}
              onDragEnd={handleDragEnd}
              className={cn(
                validatedLeads.length > 0
                  ? "h-[calc(100vh-320px)] min-w-[800px]"
                  : "h-[calc(100vh-200px)] min-w-[800px]",
                "p-1"
              )}
            >
              {(column) => (
                <KanbanBoard
                  id={column.id}
                  key={column.id}
                  className={cn(
                    column.bgColor,
                    !column.canEdit && "opacity-65",
                    "border-none shadow-none"
                  )}
                >
                  <KanbanHeader className="border-none">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={"ghost"}
                        className={cn(column.textColor, column.bgTextColor)}
                      >
                        {column.name}
                      </Badge>
                      <Badge variant="ghost" className="text-xs">
                        {
                          kanbanData.filter((item) => item.column === column.id)
                            .length
                        }
                      </Badge>
                    </div>
                  </KanbanHeader>
                  <KanbanCards id={column.id}>
                    {(item: any) => (
                      <KanbanCard
                        id={item.id}
                        key={item.id}
                        name={item.name}
                        column={item.column}
                        className={cn(
                          "w-72 transition-colors duration-300",
                          column.shadowColor,
                          column.borderColor,
                          column.hoverColor
                        )}
                      >
                        <OpportunityCard
                          key={item.opportunity.id}
                          opportunity={item.opportunity}
                          disableClick={true}
                          showOpenButton={true}
                          noWrapper={true}
                        />
                      </KanbanCard>
                    )}
                  </KanbanCards>
                </KanbanBoard>
              )}
            </KanbanProvider>
          </div>
        </div>
      )}
    </div>
  );
}
