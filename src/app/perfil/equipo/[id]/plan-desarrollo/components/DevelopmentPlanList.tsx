"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronUp, Calendar, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Task {
  id: string;
  name: string;
  endDate: string;
  completed: boolean;
}

interface DevelopmentPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  competences: string[];
  tasks: Task[];
}

interface DevelopmentPlanListProps {
  personId: number;
}

// Data mockeada
const mockPlans: DevelopmentPlan[] = [
  {
    id: "1",
    title: "Desarrollo de Habilidades de Liderazgo",
    description:
      "Plan enfocado en mejorar las competencias de liderazgo y gestión de equipos para asumir roles de mayor responsabilidad en la organización.",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    competences: ["Liderazgo", "Comunicación Efectiva", "Gestión de Equipos"],
    tasks: [
      {
        id: "t1",
        name: "Completar curso de liderazgo transformacional",
        endDate: "2024-02-28",
        completed: true,
      },
      {
        id: "t2",
        name: "Participar en workshop de comunicación asertiva",
        endDate: "2024-03-15",
        completed: true,
      },
      {
        id: "t3",
        name: "Liderar proyecto piloto con equipo multidisciplinario",
        endDate: "2024-05-30",
        completed: false,
      },
      {
        id: "t4",
        name: "Realizar sesiones de coaching con mentor asignado",
        endDate: "2024-06-15",
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Mejora de Competencias Técnicas en Desarrollo de Software",
    description:
      "Fortalecer conocimientos en tecnologías modernas de desarrollo y arquitectura de software para liderar proyectos de mayor complejidad técnica.",
    startDate: "2024-02-01",
    endDate: "2024-08-31",
    competences: ["Desarrollo Full Stack", "Arquitectura de Software"],
    tasks: [
      {
        id: "t5",
        name: "Certificación en AWS Solutions Architect",
        endDate: "2024-04-30",
        completed: false,
      },
      {
        id: "t6",
        name: "Completar bootcamp de React y Next.js",
        endDate: "2024-05-15",
        completed: false,
      },
      {
        id: "t7",
        name: "Desarrollar aplicación demo con microservicios",
        endDate: "2024-07-31",
        completed: false,
      },
    ],
  },
];

export default function DevelopmentPlanList({
  personId,
}: DevelopmentPlanListProps) {
  console.log("Person ID:", personId);
  const [plans, setPlans] = useState<DevelopmentPlan[]>(mockPlans);
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set());

  const togglePlan = (planId: string) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  const toggleTaskCompletion = (planId: string, taskId: string) => {
    setPlans(
      plans.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            tasks: plan.tasks.map((task) =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
          };
        }
        return plan;
      })
    );
  };

  const calculateProgress = (tasks: Task[]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  };

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              No hay planes de desarrollo registrados
            </p>
            <p className="text-sm mt-2">
              Crea tu primer plan de desarrollo haciendo clic en "Crear Plan"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => {
        const progress = calculateProgress(plan.tasks);
        const isExpanded = expandedPlans.has(plan.id);
        const completedTasks = plan.tasks.filter((t) => t.completed).length;

        return (
          <Collapsible
            key={plan.id}
            open={isExpanded}
            onOpenChange={() => togglePlan(plan.id)}
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {plan.competences.map((competence, index) => (
                        <Badge key={index} variant="secondary">
                          {competence}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl">{plan.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {plan.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(plan.startDate).toLocaleDateString("es-ES")} -{" "}
                      {new Date(plan.endDate).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedTasks} de {plan.tasks.length} tareas completadas
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progreso</span>
                    <span className="text-muted-foreground">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <CollapsibleContent>
                  <div className="pt-4 mt-4 border-t space-y-3">
                    <h4 className="font-semibold text-sm">
                      Tareas ({plan.tasks.length})
                    </h4>
                    <div className="space-y-2">
                      {plan.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() =>
                              toggleTaskCompletion(plan.id, task.id)
                            }
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <p
                              className={`text-sm font-medium ${
                                task.completed
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {task.name}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Fecha fin:{" "}
                              {new Date(task.endDate).toLocaleDateString(
                                "es-ES"
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </CardContent>

              <CardFooter className="bg-muted/30 justify-end">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver más
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
              </CardFooter>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
