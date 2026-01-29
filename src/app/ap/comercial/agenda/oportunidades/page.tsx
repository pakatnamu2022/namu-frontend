"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import {
  useMyOpportunitiesByStatus,
  useUpdateOpportunity,
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
  COLUMN_TO_STATUS_ID,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { errorToast, ERROR_MESSAGE, successToast } from "@/core/core.function";
import { cn } from "@/lib/utils";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import OpportunityActions from "@/features/ap/comercial/oportunidades/components/OpportunityActions";
import { discardLead } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.actions";
import { MANAGE_LEADS } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.constants";
import { useInvalidateQuery } from "@/core/core.hook";
import { useCommercialFiltersStore } from "@/features/ap/ap-master/lib/commercial.store";
import { useMyConsultants } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import { EMPRESA_AP } from "@/core/core.constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  useCalendarMonth,
  useCalendarYear,
} from "@/shared/components/CalendarGrid";
import PageWrapper from "@/shared/components/PageWrapper";

export default function OpportunitiesKanbanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = AGENDA;
  const { QUERY_KEY: LEADS_QUERY_KEY, MODEL } = MANAGE_LEADS;
  const { QUERY_KEY } = OPPORTUNITIES;
  const { selectedAdvisorId, setSelectedAdvisorId } =
    useCommercialFiltersStore();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [searchTerm, setSearchTerm] = useState("");
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const permissions = useModulePermissions(ROUTE);
  const invalidateQuery = useInvalidateQuery();

  // Get calendar state from atoms
  const [calendarMonth] = useCalendarMonth();
  const [calendarYear] = useCalendarYear();

  // Check if user has permission to view all users' opportunities
  const canViewAdvisors = permissions.canViewAdvisors || false;

  // Get month range based on calendar state
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);

  const dateFrom = firstDay.toISOString().split("T")[0];
  const dateTo = lastDay.toISOString().split("T")[0];

  // Load advisors only if user has permission - filters by active period (year/month)
  const { data: workers = [], isLoading: isLoadingWorkers } = useMyConsultants({
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
    year: calendarYear,
    month: calendarMonth + 1,
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(opportunitySearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [opportunitySearch]);

  // Build base query params (without opportunity_status_id)
  const baseParams = useMemo(() => {
    const params: Record<string, any> = {
      date_from: dateFrom,
      date_to: dateTo,
      per_page: 5,
    };
    if (canViewAdvisors && selectedAdvisorId) {
      params.worker_id = selectedAdvisorId;
    }
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    return params;
  }, [canViewAdvisors, selectedAdvisorId, dateFrom, dateTo, debouncedSearch]);

  // 5 independent queries, one per status column
  const columns = OPPORTUNITIES_COLUMNS;

  const columnQueries = columns.map((col) => {
    const statusId = COLUMN_TO_STATUS_ID[col.id];
    return useMyOpportunitiesByStatus(statusId, baseParams);
  });

  const updateMutation = useUpdateOpportunity();

  // Get validated leads (potential buyers)
  const { data: validatedLeads = [], isLoading: isLoadingLeads } = useMyLeads({
    worker_id: canViewAdvisors ? selectedAdvisorId : undefined,
  });

  // Check if initial load is happening (first page of all queries)
  const isLoading = columnQueries.some((q) => q.isLoading);

  // Merge all fetched opportunities into kanban data
  const allOpportunities = useMemo(() => {
    return columnQueries.flatMap(
      (q) => q.data?.pages.flatMap((page) => page.data) ?? [],
    );
  }, [columnQueries.map((q) => q.data)]);

  // Get total per column from meta
  const columnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    columns.forEach((col, i) => {
      const lastPage = columnQueries[i].data?.pages.at(-1);
      totals[col.id] = lastPage?.meta.total ?? 0;
    });
    return totals;
  }, [columnQueries.map((q) => q.data)]);

  const kanbanData = useMemo(
    () =>
      allOpportunities.map((opp) => ({
        id: opp.id.toString(),
        name: opp.family.description,
        column: opp.opportunity_status,
        opportunity: opp,
      })),
    [allOpportunities],
  );

  // Scroll handler per column
  const handleColumnScrollEnd = useCallback(
    (columnIndex: number) => {
      const query = columnQueries[columnIndex];
      if (query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    },
    [columnQueries],
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const opportunity = allOpportunities.find(
      (o) => o.id.toString() === active.id,
    );
    if (!opportunity) return;

    // Determinar si se movió a una columna o a otra tarjeta
    let targetColumnId = over.id as string;

    // Si se soltó sobre otra tarjeta, encontrar su columna
    const overOpportunity = allOpportunities.find(
      (o) => o.id.toString() === over.id,
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
      errorToast(
        "No se pueden mover oportunidades que están Vendidas o Cerradas",
      );
      invalidateQuery([QUERY_KEY, "my", "status"]);
      return;
    }

    const targetColumn = columns.find((col) => col.id === targetColumnId);
    if (!targetColumn) {
      invalidateQuery([QUERY_KEY, "my", "status"]);
      return;
    }

    // PREVENIR el movimiento si la columna no es editable
    if (!targetColumn.canEdit) {
      errorToast("No se puede mover a esta columna directamente");
      invalidateQuery([QUERY_KEY, "my", "status"]);
      return;
    }

    // Usar directamente el COLUMN_TO_STATUS_ID en vez de buscar en statuses
    const targetStatusId = COLUMN_TO_STATUS_ID[targetColumn.id];
    if (!targetStatusId) {
      invalidateQuery([QUERY_KEY, "my", "status"]);
      return;
    }

    // Update opportunity status
    updateMutation.mutate(
      {
        id: opportunity.id,
        data: {
          opportunity_status_id: targetStatusId.toString(),
        },
      },
      {
        onSuccess: () => {
          invalidateQuery([QUERY_KEY, "my", "status"]);
        },
        onError: () => {
          invalidateQuery([QUERY_KEY, "my", "status"]);
        },
      },
    );
  };

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
    reasonDiscardingId: number,
  ) => {
    discardLead(leadId, comment, reasonDiscardingId)
      .then(() => {
        successToast("Lead descartado exitosamente");
        invalidateQuery([LEADS_QUERY_KEY, "my"]);
      })
      .catch(() => {
        errorToast(ERROR_MESSAGE(MODEL, "update"));
      });
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <PageWrapper>
      <HeaderTableWrapper>
        <TitleComponent
          title="Tablero de Oportunidades"
          subtitle="Gestiona tus oportunidades arrastrando y soltando"
          icon="Target"
        />

        <div className="flex items-center gap-2 w-full">
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
                <Input
                  type="text"
                  placeholder="Buscar lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs h-8 text-sm"
                />
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
                  No se encontraron leads que coincidan con &quot;{searchTerm}
                  &quot;
                </div>
              )}
            </div>
          )}

          {/* Search + Kanban Boards */}
          <div className="px-2">
            <Input
              type="text"
              placeholder="Buscar oportunidad..."
              value={opportunitySearch}
              onChange={(e) => setOpportunitySearch(e.target.value)}
              className="max-w-xs h-8 text-sm"
            />
          </div>
          <div className="flex-1 overflow-hidden overflow-x-auto lg:overflow-x-hidden">
            <KanbanProvider
              columns={columns}
              data={kanbanData}
              onDragEnd={handleDragEnd}
              className={cn(
                validatedLeads.length > 0
                  ? "h-[calc(100vh-320px)] min-w-[800px]"
                  : "h-[calc(100vh-200px)] min-w-[800px]",
                "p-1",
              )}
            >
              {(column) => {
                const columnIndex = columns.findIndex(
                  (c) => c.id === column.id,
                );
                const query = columnQueries[columnIndex];
                return (
                  <KanbanBoard
                    id={column.id}
                    key={column.id}
                    className={cn(
                      column.bgColor,
                      !column.canEdit && "opacity-65",
                      "border-none shadow-none",
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
                          {columnTotals[column.id] ?? 0}
                        </Badge>
                      </div>
                    </KanbanHeader>
                    <KanbanCards
                      id={column.id}
                      onScrollEnd={() => handleColumnScrollEnd(columnIndex)}
                      isLoadingMore={query?.isFetchingNextPage}
                    >
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
                            column.hoverColor,
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
                );
              }}
            </KanbanProvider>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
