"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { notFound } from "@/shared/hooks/useNotFound";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Plus,
  LayoutDashboard,
  List,
  Calendar,
  GanttChartSquare,
  TrendingUp,
  Filter,
  FolderKanban,
  X,
} from "lucide-react";
import { errorToast, successToast } from "@/core/core.function";
import PageWrapper from "@/shared/components/PageWrapper";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useScrumProjects } from "@/features/gp/tics/pm/scrumProject/lib/scrumProject.hook";
import { useScrumSprints } from "@/features/gp/tics/pm/scrumSprint/lib/scrumSprint.hook";
import { useScrumTags } from "@/features/gp/tics/pm/scrumTag/lib/scrumTag.hook";
import {
  useScrumKanban,
  useScrumItems,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.hook";
import { ScrumItemPriority } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.interface";
import {
  storeScrumItem,
  updateScrumItem,
} from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.actions";
import { ItemForm } from "@/features/gp/tics/pm/scrumItem/components/ItemForm";
import { ItemDetailSheet } from "@/features/gp/tics/pm/scrumItem/components/ItemDetailSheet";
import { ScrumItemSchema } from "@/features/gp/tics/pm/scrumItem/lib/scrumItem.schema";

import { KanbanView } from "@/features/gp/tics/pm/scrumItem/components/KanbanView";
import { ListView } from "@/features/gp/tics/pm/scrumItem/components/ListView";
import { CalendarView } from "@/features/gp/tics/pm/scrumItem/components/CalendarView";
import { GanttView } from "@/features/gp/tics/pm/scrumItem/components/GanttView";
import { EffortView } from "@/features/gp/tics/pm/scrumItem/components/EffortView";

type ViewMode = "kanban" | "list" | "calendar" | "gantt" | "effort";
type FilterKey = "priority" | "tag" | "assignee";

const FILTER_DEFS: { key: FilterKey; label: string }[] = [
  { key: "priority", label: "Prioridad" },
  { key: "tag", label: "Etiqueta" },
  { key: "assignee", label: "Responsable" },
];

function SelectionPrompt({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.FC<any>;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center px-6">
      <Icon className="size-8 text-muted-foreground/50" />
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground max-w-xs">{subtitle}</p>
    </div>
  );
}

const VIEWS: { id: ViewMode; label: string; Icon: React.FC<any> }[] = [
  { id: "kanban", label: "Tablero", Icon: LayoutDashboard },
  { id: "list", label: "Lista", Icon: List },
  { id: "calendar", label: "Calendario", Icon: Calendar },
  { id: "gantt", label: "Gantt", Icon: GanttChartSquare },
  { id: "effort", label: "Esfuerzo", Icon: TrendingUp },
];

export default function KanbanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [projectId, setProjectId] = useState<string>("");
  const [historyFilter, setHistoryFilter] = useState<string>("");
  const [sprintFilter, setSprintFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [activeFilterKeys, setActiveFilterKeys] = useState<FilterKey[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailItemId, setDetailItemId] = useState<number | null>(null);
  const [ganttFocusId, setGanttFocusId] = useState<number | null>(null);

  const handleFocusInGantt = (id: number) => {
    setViewMode("gantt");
    setGanttFocusId(id);
  };

  // Si el sheet ya está abierto con este mismo item, un segundo clic lo
  // cierra (toggle); si es otro item, solo cambia el contenido sin cerrar.
  const handleItemClick = (id: number) => {
    setDetailItemId((prev) => (prev === id ? null : id));
  };

  const { data: projectsData } = useScrumProjects({ per_page: 100, status: "activo" });
  const projects = projectsData?.data ?? [];

  const resolvedProjectId = projectId ? Number(projectId) : null;
  const { data: allSprints = [] } = useScrumSprints();

  const sprints = resolvedProjectId
    ? allSprints.filter((s) => s.project_id === resolvedProjectId)
    : allSprints;

  const activeSprint = sprints.find((s) => s.status === "activo");

  useEffect(() => {
    setHistoryFilter("");
    setSprintFilter("");
    setPriorityFilter("");
    setTagFilter("");
    setAssigneeFilter("");
    setActiveFilterKeys([]);
  }, [projectId]);

  const { data: tagsData } = useScrumTags(resolvedProjectId ?? undefined);
  const tags = tagsData ?? [];

  const kanbanParams = useMemo(
    () =>
      resolvedProjectId
        ? {
            project_id: resolvedProjectId,
            history_id: historyFilter || undefined,
            sprint_id: sprintFilter || undefined,
            priority: priorityFilter || undefined,
            tag_id: tagFilter || undefined,
            assigned_to: assigneeFilter || undefined,
          }
        : null,
    [resolvedProjectId, historyFilter, sprintFilter, priorityFilter, tagFilter, assigneeFilter],
  );

  const { data: kanban, isLoading: loadingKanban, refetch } = useScrumKanban(kanbanParams);

  const { data: itemsResponse, isLoading: loadingItems } = useScrumItems(
    { project_id: resolvedProjectId ?? undefined, per_page: 200 },
    resolvedProjectId !== null,
  );
  const allListItems = itemsResponse?.data ?? [];

  // Los mismos filtros (prioridad/etiqueta/responsable) del tablero se
  // aplican también a Lista/Calendario/Gantt, que traen todo el proyecto de
  // una sola vez (esas vistas no pegan al endpoint filtrado del Kanban).
  const listItems = useMemo(() => {
    const historyId = historyFilter ? Number(historyFilter) : null;
    const sprintId = sprintFilter ? Number(sprintFilter) : null;
    return allListItems.filter((item) => {
      if (historyId && item.id !== historyId && item.parent_id !== historyId) return false;
      if (sprintId && item.sprint_id !== sprintId) return false;
      if (priorityFilter && item.priority !== priorityFilter) return false;
      if (tagFilter && !item.tags?.some((t) => t.id === Number(tagFilter))) return false;
      if (assigneeFilter && item.assigned_to !== Number(assigneeFilter)) return false;
      return true;
    });
  }, [allListItems, historyFilter, sprintFilter, priorityFilter, tagFilter, assigneeFilter]);

  const historyOptions = useMemo(() => {
    // Ordenadas por fecha de fin (cuál termina primero) y, si empatan, por
    // `order` (orden real de creación/secuencia asignado por el backend) en
    // vez del orden crudo en que llega el array, para que el filtro se lea
    // como una línea de tiempo y no como una lista de ids sueltos.
    return allListItems
      .filter((item) => !item.parent_id)
      .sort((a, b) => {
        const dueA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dueB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        if (dueA !== dueB) return dueA - dueB;
        return a.order - b.order;
      })
      .map((item, index) => ({
        label: `${index + 1}. ${item.title}`,
        value: item.id.toString(),
      }));
  }, [allListItems]);

  const assigneeOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const item of allListItems) {
      if (item.assignee) seen.set(item.assignee.id, item.assignee.name);
    }
    return Array.from(seen, ([id, name]) => ({ label: name, value: id.toString() }));
  }, [allListItems]);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateScrumItem(id, { status: status as any }),
    onSuccess: () => refetch(),
    onError: () => errorToast("Error al mover el item"),
  });

  const storeMutation = useMutation({
    mutationFn: (data: ScrumItemSchema) =>
      storeScrumItem({
        project_id: Number(data.project_id),
        sprint_id: data.sprint_id ? Number(data.sprint_id) : null,
        type: data.type,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        story_points: data.story_points ? Number(data.story_points) : null,
        estimated_hours: data.estimated_hours ? Number(data.estimated_hours) : null,
        start_date: data.start_date || null,
        due_date: data.due_date || null,
        assigned_to: data.assigned_to ? Number(data.assigned_to) : null,
      }),
    onSuccess: () => {
      successToast("Item creado exitosamente");
      setAddModalOpen(false);
      refetch();
    },
    onError: () => errorToast("Error al crear el item"),
  });

  const projectOptions = projects.map((p) => ({ label: p.name, value: p.id.toString() }));
  const sprintOptions = sprints.map((s) => ({ label: s.name, value: s.id.toString() }));
  const priorityOptions = [
    { label: "Alta", value: "alta" satisfies ScrumItemPriority },
    { label: "Media", value: "media" satisfies ScrumItemPriority },
    { label: "Baja", value: "baja" satisfies ScrumItemPriority },
  ];
  const tagOptions = tags.map((t) => ({ label: t.name, value: t.id.toString() }));

  const filterState: Record<FilterKey, { value: string; setValue: (v: string) => void; options: { label: string; value: string }[]; placeholder: string }> = {
    priority: { value: priorityFilter, setValue: setPriorityFilter, options: priorityOptions, placeholder: "Prioridad" },
    tag: { value: tagFilter, setValue: setTagFilter, options: tagOptions, placeholder: "Etiqueta" },
    assignee: { value: assigneeFilter, setValue: setAssigneeFilter, options: assigneeOptions, placeholder: "Responsable" },
  };

  const availableFilterDefs = FILTER_DEFS.filter((f) => !activeFilterKeys.includes(f.key));

  const addFilter = (key: FilterKey) => {
    setActiveFilterKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const removeFilter = (key: FilterKey) => {
    setActiveFilterKeys((prev) => prev.filter((k) => k !== key));
    filterState[key].setValue("");
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("kanban")) notFound();
  if (!currentView) notFound();

  return (
    <>
      <PageWrapper>
        {/* Header */}
        <div className="flex flex-col gap-3 pb-3 border-b">
          <TitleComponent
            title={currentView.descripcion}
            subtitle="Gestiona tus tareas al estilo Jira"
            icon={currentView.icon}
          >
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* Filtros fijos, en cascada: Proyecto > Historia > Sprint. No se
                  puede elegir historia ni sprint sin proyecto seleccionado. */}
              <SearchableSelect
                value={projectId}
                onChange={setProjectId}
                options={projectOptions}
                placeholder="Proyecto"
              />
              <SearchableSelect
                value={historyFilter}
                onChange={setHistoryFilter}
                options={historyOptions}
                placeholder="Historia"
                buttonSize="sm"
                disabled={!resolvedProjectId}
              />
              <SearchableSelect
                value={sprintFilter}
                onChange={setSprintFilter}
                options={sprintOptions}
                placeholder="Sprint"
                buttonSize="sm"
                disabled={!resolvedProjectId}
              />

              {/* Filtros adicionales estilo Notion: solo se muestran los que
                  el usuario agrega. */}
              {resolvedProjectId && (
                <>
                  {activeFilterKeys.map((key) => {
                    const def = filterState[key];
                    return (
                      <div key={key} className="flex items-center gap-0.5">
                        <SearchableSelect
                          value={def.value}
                          onChange={def.setValue}
                          options={def.options}
                          placeholder={def.placeholder}
                          buttonSize="sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          onClick={() => removeFilter(key)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    );
                  })}
                  {availableFilterDefs.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                          <Filter className="size-3 mr-1" /> Filtro
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {availableFilterDefs.map((f) => (
                          <DropdownMenuItem key={f.key} onClick={() => addFilter(f.key)}>
                            {f.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button size="sm" onClick={() => setAddModalOpen(true)}>
                    <Plus className="size-3.5 mr-1" /> Item
                  </Button>
                </>
              )}
            </div>
          </TitleComponent>

          {/* View switcher */}
          <div className="flex items-center gap-1 border rounded-lg p-0.5 w-fit bg-muted/40">
            {VIEWS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setViewMode(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors",
                  viewMode === id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/60",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        <div className="h-[calc(100vh-230px)] overflow-hidden flex flex-col pt-2">
          {!resolvedProjectId ? (
            <SelectionPrompt
              icon={FolderKanban}
              title="Selecciona un proyecto"
              subtitle="Elige un proyecto en el filtro de arriba para ver su tablero."
            />
          ) : (
            <>
              {viewMode === "kanban" && (
                <KanbanView
                  kanban={kanban as any}
                  isLoading={loadingKanban}
                  onItemClick={handleItemClick}
                  onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
                />
              )}
              {viewMode === "list" && (
                <ListView
                  items={listItems}
                  sprints={sprints}
                  isLoading={loadingItems}
                  onItemClick={handleItemClick}
                  onFocusInGantt={handleFocusInGantt}
                />
              )}
              {viewMode === "calendar" && (
                <CalendarView
                  items={listItems}
                  isLoading={loadingItems}
                  onItemClick={handleItemClick}
                />
              )}
              {viewMode === "gantt" && (
                <GanttView
                  sprints={sprints}
                  items={listItems}
                  isLoading={loadingItems}
                  onItemClick={handleItemClick}
                  focusItemId={ganttFocusId}
                  onFocused={() => setGanttFocusId(null)}
                />
              )}
              {viewMode === "effort" && (
                <EffortView items={listItems} isLoading={loadingItems} />
              )}
            </>
          )}
        </div>
      </PageWrapper>

      <GeneralModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Nuevo item"
        subtitle="Agrega un item al proyecto"
        icon="SquareCheckBig"
        size="4xl"
      >
        <ItemForm
          defaultValues={{
            project_id: projectId,
            sprint_id: activeSprint?.id.toString() ?? "",
            status: "por_hacer",
          }}
          onSubmit={storeMutation.mutate}
          onCancel={() => setAddModalOpen(false)}
          isSubmitting={storeMutation.isPending}
          projects={projects}
          sprints={sprints}
        />
      </GeneralModal>

      <ItemDetailSheet
        itemId={detailItemId}
        open={detailItemId !== null}
        onClose={() => setDetailItemId(null)}
      />
    </>
  );
}
