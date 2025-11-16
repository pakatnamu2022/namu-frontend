"use client";

import AvailableCompanies from "@/src/features/companies/components/Companies";
import MainLayout from "@/src/features/dashboard/components/MainLayout";

export default function CompaniesPage() {
  return (
    <MainLayout>
      <div className="h-full w-full max-w-(--breakpoint-2xl) mx-auto">
        <div className="absolute inset-0 bg-primary/2"></div>

        <div className="relative z-10">
          <div className="w-full p-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* <div className="lg:col-span-1 space-y-6 border-primary/10 md:border-r">
            </div> */}

              <div className="lg:col-span-3 flex flex-col gap-4">
                <div>
                  <h1 className="md:text-2xl font-bold text-primary dark:text-primary-foreground">
                    Empresas Disponibles
                  </h1>
                  <p className="text-muted-foreground md:text-base text-xs">
                    Selecciona la empresa con la que deseas trabajar
                  </p>
                </div>

                <div className="grid gap-6">
                  <AvailableCompanies />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
