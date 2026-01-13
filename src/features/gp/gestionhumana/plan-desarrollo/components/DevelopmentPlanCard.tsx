"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { DevelopmentPlanResource } from "../lib/developmentPlan.interface";
import { DevelopmentPlanHeader } from "./DevelopmentPlanHeader";
import { DevelopmentPlanStats } from "./DevelopmentPlanStats";
import { DevelopmentPlanTaskList } from "./DevelopmentPlanTaskList";
import { DevelopmentPlanComments } from "./DevelopmentPlanComments";

interface DevelopmentPlanCardProps {
  plan: DevelopmentPlanResource;
  isLeader: boolean;
  isExpanded: boolean;
  newComment: string;
  onToggleExpand: () => void;
  onToggleObjectivesCompetences: () => void;
  expandedObjectivesCompetences: boolean;
  onDelete: () => void;
  onToggleTask: (taskId: number) => void;
  onCommentChange: (value: string) => void;
  onSubmitComment: () => void;
}

export function DevelopmentPlanCard({
  plan,
  isLeader,
  isExpanded,
  newComment,
  onToggleExpand,
  onToggleObjectivesCompetences,
  expandedObjectivesCompetences,
  onDelete,
  onToggleTask,
  onCommentChange,
  onSubmitComment,
}: DevelopmentPlanCardProps) {
  const calculateProgress = (tasks: DevelopmentPlanResource["tasks"]) => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((task) => task.fulfilled).length;
    return (completedTasks / tasks.length) * 100;
  };

  const progress = calculateProgress(plan.tasks);
  const completedTasks = plan.tasks.filter((t) => t.fulfilled).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <DevelopmentPlanHeader
            plan={plan}
            isLeader={isLeader}
            expandedObjectivesCompetences={expandedObjectivesCompetences}
            onToggleObjectivesCompetences={onToggleObjectivesCompetences}
            onDelete={onDelete}
          />
        </CardHeader>

        <CardContent className="pt-0 pb-3 space-y-3">
          <DevelopmentPlanStats
            startDate={plan.start_date}
            endDate={plan.end_date}
            completedTasks={completedTasks}
            totalTasks={plan.tasks.length}
            progress={progress}
          />

          <CollapsibleContent>
            <div className="pt-3 border-t space-y-3">
              <DevelopmentPlanTaskList
                tasks={plan.tasks}
                isLeader={isLeader}
                onToggleTask={onToggleTask}
              />

              <DevelopmentPlanComments
                comment={plan.comment}
                isLeader={isLeader}
                newComment={newComment}
                onCommentChange={onCommentChange}
                onSubmitComment={onSubmitComment}
              />
            </div>
          </CollapsibleContent>
        </CardContent>

        <CardFooter className="bg-muted/30 justify-center py-2 border-t">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  Ver detalles
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </CardFooter>
      </Card>
    </Collapsible>
  );
}
