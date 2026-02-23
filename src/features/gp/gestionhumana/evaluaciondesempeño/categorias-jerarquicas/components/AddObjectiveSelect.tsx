import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SearchableSelectAsync } from "@/shared/components/SearchableSelectAsync";
import { useObjectives } from "../../objetivos/lib/objective.hook";
import { ObjectiveResource } from "../../objetivos/lib/objective.interface";

interface Props {
  adding: boolean;
  setSelectedId: (id: number) => void;
  selectedId: number | null;
  isDuplicate: (id: number) => boolean;
  isUpdating: boolean;
  addObjective: () => void;
}

export const AddObjectiveSelect = ({
  adding,
  setSelectedId,
  selectedId,
  isDuplicate,
  isUpdating,
  addObjective,
}: Props) => {
  return (
    <AnimatePresence initial={false}>
      {adding && (
        <motion.div
          key="adder"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="border rounded-md p-3 bg-tertiary"
        >
          <div className="flex items-center gap-2 w-full">
            <SearchableSelectAsync
              onChange={(val) => setSelectedId(Number(val))}
              useQueryHook={useObjectives}
              additionalParams={{
                active: 1,
              }}
              mapOptionFn={(o: ObjectiveResource) => ({
                value: o.id.toString(),
                label: o.name,
                description: o.isAscending ? "Ascendente" : "Descendente",
              })}
              value={selectedId ? String(selectedId) : ""}
              placeholder="Selecciona un objetivo"
              className="w-full! truncate text-xs"
            />

            <Button
              className="w-fit aspect-square"
              variant="outline"
              size="icon"
              onClick={addObjective}
              disabled={!selectedId || isDuplicate(selectedId) || isUpdating}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
