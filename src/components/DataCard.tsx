import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface DataField {
  key: string;
  label: string;
  icon: LucideIcon;
  value: ReactNode;
}

export interface DataSection {
  key: string;
  title: string;
  icon?: LucideIcon;
  fields: DataField[];
  columns?: 1 | 2 | 3 | 4;
}

interface DataCardProps {
  title: string;
  fields?: DataField[];
  sections?: DataSection[];
  columns?: 1 | 2 | 3 | 4;
}

const getGridClass = (columns: 1 | 2 | 3 | 4): string => {
  const gridClasses: Record<1 | 2 | 3 | 4, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };
  return gridClasses[columns] || gridClasses[3];
};

export function DataCard({
  title,
  fields = [],
  sections = [],
  columns = 3,
}: DataCardProps) {
  const gridClass = getGridClass(columns);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm bg-white">
      {/* Header */}
      <div className="bg-primary px-5 py-2 flex items-center gap-3">
        <h4 className="font-semibold text-white text-sm tracking-wide">
          {title}
        </h4>
      </div>

      {/* Content */}
      <div className="p-6">
        {fields.length > 0 && (
          <div className={`grid ${gridClass} gap-6`}>
            {fields.map((field) => {
              const IconComponent = field.icon;

              return (
                <div key={field.key} className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-primary shrink-0" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                      {field.label}
                    </p>
                  </div>
                  <p className="font-medium text-sm text-slate-900 ml-6">
                    {field.value}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {sections.map((section, index) => {
          const sectionGridClass = getGridClass(section.columns || columns);
          const SectionIcon = section.icon;

          return (
            <div
              key={section.key}
              className={`pt-4 ${index > 0 || fields.length > 0 ? "border-t mt-2 border-slate-200" : ""}`}
            >
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
                  {SectionIcon && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80">
                      <SectionIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    </span>
                  )}
                  <p className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                    {section.title}
                  </p>
                </div>
              </div>

              <div className={`grid ${sectionGridClass} gap-4`}>
                {section.fields.map((field) => {
                  const IconComponent = field.icon;

                  return (
                    <div key={field.key} className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-primary shrink-0" />
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                          {field.label}
                        </p>
                      </div>
                      <p className="font-medium text-sm text-slate-900 ml-6">
                        {field.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
