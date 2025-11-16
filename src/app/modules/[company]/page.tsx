"use client";

import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import ModulesGrid from "@/features/modules/components/modules-grid";
import RedirectToCompanies from "@/features/modules/components/redirect";
import {
  ViewsResponseMenu,
  ViewsResponseMenuChild,
} from "@/features/views/lib/views.interface";
import MainLayout from "@/features/dashboard/components/MainLayout";

export default function ModulesPage() {
  const router = useNavigate();
  const params = useParams();
  const { permissions } = useAuthStore();
  const company = params.company as string;

  const modules =
    permissions?.find((perm) => perm.empresa_abreviatura === company)?.menu ||
    [];

  const companyName = permissions?.find(
    (perm) => perm.empresa_abreviatura === company
  )?.empresa_nombre;

  useEffect(() => {
    if (!company || !companyName) {
      router("/companies");
    }
  }, [company, companyName]);

  const handleModuleSelect = (
    module: ViewsResponseMenu | ViewsResponseMenuChild
  ) => {
    if (module.submodule) {
      router(`/modules/${company}/${module.slug ?? module.id.toString()}`);
    } else {
      router(`/${company}/${module.slug ?? module.id.toString()}`);
    }
  };

  return (
    <MainLayout>
      <div className="h-full w-full max-w-(--breakpoint-2xl) mx-auto">
        <div className="absolute inset-0 bg-secondary/2"></div>

        <div className="relative z-10">
          <div className="w-full p-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <ModulesGrid
                modules={modules}
                companyName={companyName}
                handleModuleSelect={handleModuleSelect}
              />
              {modules.length === 0 && <RedirectToCompanies />}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
