"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/src/features/auth/lib/auth.store";
import ModulesGrid from "@/src/features/modules/components/modules-grid";
import RedirectToCompanies from "@/src/features/modules/components/redirect";
import {
  ViewsResponseMenu,
  ViewsResponseMenuChild,
} from "@/src/features/views/lib/views.interface";
import MainLayout from "@/src/features/dashboard/components/MainLayout";

export default function ModulesPage() {
  const router = useRouter();
  const params = useParams();
  const { permissions } = useAuthStore();
  const company = params.company as string;
  const module = params.module as string;

  const modules =
    permissions?.find((perm) => perm.empresa_abreviatura === company)?.menu ||
    [];

  const submodules = modules.find((mod) => mod.slug === module)?.children || [];

  const companyName = permissions?.find(
    (perm) => perm.empresa_abreviatura === company
  )?.empresa_nombre;

  const moduleName = modules.find((mod) => mod.slug === module)?.descripcion;

  useEffect(() => {
    if (!company || !companyName) {
      router.push("/companies");
    }
  }, [company, companyName]);

  const handleModuleSelect = (
    submodule: ViewsResponseMenu | ViewsResponseMenuChild
  ) => {
    router.push(
      `/${company}/${module}/${submodule.slug ?? submodule.id.toString()}`
    );
  };

  return (
    <MainLayout>
      <div className="h-full w-full max-w-(--breakpoint-2xl) mx-auto">
        <div className="absolute inset-0 bg-secondary/3"></div>

        <div className="relative z-10">
          <div className="w-full p-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ModulesGrid
                modules={submodules}
                companyName={moduleName}
                handleModuleSelect={handleModuleSelect}
                colorClass="slate"
              />
              {modules.length === 0 && <RedirectToCompanies />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
