"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import {
  useMyOpportunitiesByStatus,
  useUpdateOpportunity,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.hook";
import { useMyLeadsInfinite } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.hook";
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
  COLUMN_TO_STATUS_ID,
  STATUS_ID_TO_COLUMN,
  OPPORTUNITY_STATUS_IDS,
} from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { OPPORTUNITIES } from "@/features/ap/comercial/oportunidades/lib/opportunities.constants";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  errorToast,
  ERROR_MESSAGE,
  successToast,
  SUCCESS_MESSAGE,
} from "@/core/core.function";
import { cn } from "@/lib/utils";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { AGENDA } from "@/features/ap/comercial/agenda/lib/agenda.constants";
import OpportunityActions from "@/features/ap/comercial/oportunidades/components/OpportunityActions";
import { discardLead } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.actions";
import { MANAGE_LEADS } from "@/features/ap/comercial/gestionar-leads/lib/manageLeads.constants";
import { useInvalidateQuery } from "@/core/core.hook";
import { useCommercialFiltersStore } from "@/features/ap/ap-master/lib/commercial.store";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useMyConsultants } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { STATUS_WORKER } from "@/features/gp/gestionhumana/gestion-de-personal/posiciones/lib/position.constant";
import {
  BUSINESS_PARTNERS,
  EMPRESA_AP,
  INCOME_SECTOR,
  TIPO_LEADS,
} from "@/core/core.constants";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  useCalendarMonth,
  useCalendarYear,
} from "@/shared/components/CalendarGrid";
import PageWrapper from "@/shared/components/PageWrapper";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { StoreVisitsForm } from "@/features/ap/comercial/visitas-tienda/components/StoreVisitsForm";
import { storeStoreVisits } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.actions";
import { STORE_VISITS } from "@/features/ap/comercial/visitas-tienda/lib/storeVisits.constants";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OpportunitiesKanbanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const { ROUTE } = AGENDA;
  const { QUERY_KEY: LEADS_QUERY_KEY, MODEL } = MANAGE_LEADS;
  const { QUERY_KEY } = OPPORTUNITIES;
  const { selectedAdvisorId, setSelectedAdvisorId } =
    useCommercialFiltersStore();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedLeadSearch, setDebouncedLeadSearch] = useState("");
  const [opportunitySearch, setOpportunitySearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [salesforceModalOpen, setSalesforceModalOpen] = useState(false);
  const permissions = useModulePermissions(ROUTE);
  const invalidateQuery = useInvalidateQuery();
  const { MODEL: STORE_VISITS_MODEL } = STORE_VISITS;
  const loggedUser = useAuthStore((s) => s.user);

  // Get calendar state from atoms
  const [calendarMonth] = useCalendarMonth();
  const [calendarYear] = useCalendarYear();

  // Check if user has permission to view all users' opportunities
  const canViewAdvisors = permissions.canViewAdvisors || false;
  const canSalesforce = permissions.canSalesforce || false;

  const salesforceMutation = useMutation({
    mutationFn: storeStoreVisits,
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(STORE_VISITS_MODEL, "create"));
      setSalesforceModalOpen(false);
      invalidateQuery([LEADS_QUERY_KEY, "my"]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(STORE_VISITS_MODEL, "create", msg));
    },
  });

  // Get month range based on calendar state
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);

  const dateFrom = firstDay.toISOString().split("T")[0];
  const dateTo = lastDay.toISOString().split("T")[0];

  // Load advisors only if user has permission - filters by active period (year/month)
  const { data: workers = [] } = useMyConsultants({
    status_id: STATUS_WORKER.ACTIVE,
    sede$empresa_id: EMPRESA_AP.id,
    year: calendarYear,
    month: calendarMonth + 1,
  });

  // Debounce lead search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLeadSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounce opportunity search input
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

  // Get validated leads (potential buyers) with infinite scroll
  const leadsQuery = useMyLeadsInfinite({
    worker_id: canViewAdvisors ? selectedAdvisorId : undefined,
    ...(debouncedLeadSearch && { search: debouncedLeadSearch }),
  });

  const validatedLeads = useMemo(
    () => leadsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [leadsQuery.data],
  );
  const isLoadingLeads = leadsQuery.isLoading;
  const leadsTotalCount = leadsQuery.data?.pages.at(-1)?.meta.total ?? 0;

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
        column:
          STATUS_ID_TO_COLUMN[opp.opportunity_status_id] ??
          opp.opportunity_status,
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

    // Check if opportunity is closed (FACTURADA/ENTREGADO/CERRADA)
    if (
      opportunity.opportunity_status_id === OPPORTUNITY_STATUS_IDS.SOLD ||
      opportunity.opportunity_status_id === OPPORTUNITY_STATUS_IDS.DELIVERED ||
      opportunity.opportunity_status_id === OPPORTUNITY_STATUS_IDS.CLOSED
    ) {
      errorToast(
        "No se pueden mover oportunidades que están Facturadas, Entregadas o Cerradas",
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

  // Fetch next page of leads when carousel reaches the end
  const handleLeadsScrollEnd = useCallback(() => {
    if (leadsQuery.hasNextPage && !leadsQuery.isFetchingNextPage) {
      leadsQuery.fetchNextPage();
    }
  }, [leadsQuery]);

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

  // Load more leads when carousel scrolls near the end
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const snapCount = carouselApi.scrollSnapList().length;
      const currentSnap = carouselApi.selectedScrollSnap();
      // When within 2 snaps of the end, fetch more
      if (snapCount - currentSnap <= 3) {
        handleLeadsScrollEnd();
      }
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, handleLeadsScrollEnd]);

  // Leads are now filtered server-side via the search param
  const filteredLeads = validatedLeads;

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
    <>
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

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Leads Carousel */}
          <div className="p-2 space-y-3">
            <div className="flex items-center justify-between gap-3">
             <div className="flex gap-2">
               <Input
                type="text"
                placeholder="Buscar lead..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs h-8 text-sm"
              />
              {canSalesforce && (
                <Button
                  color="blue"
                  onClick={() => setSalesforceModalOpen(true)}
                >
                  <Plus className="size-3" />
                  Salesforce Lead
                </Button>
              )}
             </div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-tertiary">
                  Leads Validados
                </h3>
                <Badge className="text-xs h-5">{leadsTotalCount}</Badge>
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
                {isLoadingLeads ? (
                  <CarouselItem className="pl-2 basis-full">
                    <FormSkeleton />
                  </CarouselItem>
                ) : (
                  filteredLeads.map((lead) => (
                    <CarouselItem key={lead.id} className="pl-2 basis-auto">
                      <div className="w-80">
                        <LeadCard lead={lead} onDiscard={handleDiscardLead} />
                      </div>
                    </CarouselItem>
                  ))
                )}
                {leadsQuery.isFetchingNextPage && (
                  <CarouselItem className="pl-2 basis-auto">
                    <div className="w-72 h-full flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>

            {!isLoadingLeads && filteredLeads.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                {searchTerm
                  ? `No se encontraron leads que coincidan con "${searchTerm}"`
                  : "No hay leads validados"}
              </div>
            )}
          </div>

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
                leadsTotalCount > 0 || searchTerm
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
                      "border-none shadow-none w-80 min-w-80",
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
                    {query?.isLoading ? (
                      <FormSkeleton />
                    ) : (
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
                    )}
                  </KanbanBoard>
                );
              }}
            </KanbanProvider>
          </div>
        </div>
      </PageWrapper>

      <GeneralModal
        open={salesforceModalOpen}
        onClose={() => setSalesforceModalOpen(false)}
        title="Nuevo Salesforce Lead"
        subtitle="Registra un lead desde Salesforce"
        icon="ContactRound"
        size="4xl"
      >
        <StoreVisitsForm
          defaultValues={{
            num_doc: "",
            full_name: "",
            phone: "",
            email: "",
            sede_id: "",
            vehicle_brand_id: "",
            document_type_id: BUSINESS_PARTNERS.TYPE_DOCUMENT_DNI_ID,
            income_sector_id: INCOME_SECTOR.SALESFORCE_ID,
            area_id: "",
          }}
          onSubmit={(data) =>
            salesforceMutation.mutate({
              ...data,
              registration_date: new Date()
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            })
          }
          isSubmitting={salesforceMutation.isPending}
          mode="create"
          lockedType={TIPO_LEADS.LEADS}
          disableIncomeSector
          onCancel={() => setSalesforceModalOpen(false)}
          canViewAdvisors={canViewAdvisors}
          loggedWorkerId={loggedUser?.partner_id}
        />
      </GeneralModal>
    </>
  );
}
