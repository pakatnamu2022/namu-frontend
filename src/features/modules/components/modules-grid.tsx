import {
  ViewsResponseMenu,
  ViewsResponseMenuChild,
} from "../../views/lib/views.interface";
import * as LucideReact from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import BackButton from "@/src/shared/components/BackButton";
import { useAuthStore } from "../../auth/lib/auth.store";

export default function ModulesGrid({
  modules,
  companyName,
  handleModuleSelect,
  colorClass,
}: {
  modules: ViewsResponseMenu[] | ViewsResponseMenuChild[];
  companyName?: string;
  handleModuleSelect: (
    module: ViewsResponseMenu | ViewsResponseMenuChild
  ) => void;
  colorClass?: string;
}) {
  useEffect(() => {
    if (modules && modules?.length === 1) {
      handleModuleSelect(modules[0]);
    }
  }, [modules, handleModuleSelect]);

  const { permissions } = useAuthStore();
  const { currentCompany, currentModule } = useCurrentModule();

  const ruta = currentModule
    ? `/modules/${currentCompany?.empresa_abreviatura}`
    : `/companies`;

  const name = currentModule
    ? currentCompany?.empresa_nombre ?? ""
    : "Empresas";

  return (
    <div className="lg:col-span-3 flex flex-col gap-4">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-4">
          {currentCompany && permissions && permissions.length > 1 && (
            <BackButton route={ruta} name={name} size="icon" />
          )}
          <div>
            <h1
              className={cn(
                "md:text-2xl font-bold dark:text-primary-foreground",
                colorClass === "slate" ? "text-slate-600" : "text-primary"
              )}
            >
              Módulos de {companyName}
            </h1>
            <p className="text-muted-foreground md:text-base text-xs">
              Selecciona el módulo con el que deseas trabajar
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {modules.map((module, index) => {
          const IconComponent = LucideReact[
            module.icon ?? "FolderDot"
          ] as React.ComponentType<any>;
          return (
            <Button
              key={module.id}
              variant={"outline"}
              className="group hover:shadow-lg transition-all duration-500 cursor-pointer bg-background/90 backdrop-blur-xs hover:scale-[1.03] relative overflow-hidden h-fit w-full"
              onClick={() => handleModuleSelect(module)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center relative z-10 flex-row gap-2 md:gap-4 md:p-2 space-y-0 w-full flex items-center">
                <div className="relative">
                  <div
                    className={cn(
                      "size-8 md:size-12 rounded-sm md:rounded-2xl flex items-center justify-center group-hover:scale-[1.2] transition-all duration-500 shadow-lg text-white",
                      colorClass === "slate"
                        ? "bg-tertiary dark:group-hover:bg-muted"
                        : "bg-primary"
                    )}
                  >
                    <IconComponent className="min-h-4 min-w-3 md:min-h-6 md:min-w-6" />
                  </div>
                </div>
                <div className="flex flex-col justify-center items-start md:gap-1">
                  <div
                    className={cn(
                      "text-base md:text-lg font-bold transition-colors duration-300 text-start",
                      colorClass === "slate"
                        ? "text-tertiary dark:text-tertiary-foreground"
                        : "text-primary dark:text-primary-foreground group-hover:text-primary"
                    )}
                  >
                    {module.descripcion}
                  </div>
                  <div className="text-xs md:text-base text-muted-foreground transition-colors duration-300">
                    {module.descripcion}
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
