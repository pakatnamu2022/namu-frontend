"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import CardSkeletonGrid from "@/shared/components/CardSkeletonGrid";
import { CONSTANTS } from "@/core/core.constants";

export default function AvailableCompanies() {
  const router = useNavigate();
  const { permissions } = useAuthStore();

  const handleCompanySelect = (company: string) => {
    router(`/modules/${company}`);
  };

  // useEffect(() => {
  //   if (permissions && permissions?.length === 1) {
  //     handleCompanySelect(permissions[0].empresa_abreviatura);
  //   }
  // }, [permissions, router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {permissions?.length === 0
        ? Array.from({ length: 4 }, (_, index) => (
            <CardSkeletonGrid key={index} />
          ))
        : permissions?.map((company, index) => {
            const empresaData = CONSTANTS.EMPRESAS.find(
              (c: any) => c.id === company.empresa_id,
            );
            const logo = empresaData?.scrWhite || "/logos/default.svg";
            const backgroundImage =
              empresaData?.image || "/images/modules/default.webp";
            return (
              <Card
                key={company.empresa_id}
                className="group hover:shadow-xl transition-all duration-500 cursor-pointer border-0 hover:scale-[1.02] relative overflow-hidden h-48 md:h-64"
                onClick={() => handleCompanySelect(company.empresa_abreviatura)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url(${backgroundImage})` }}
                />

                <div className="absolute inset-0 bg-linear-to-t from-primary/70 dark:from-muted via-primary/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex items-center gap-4">
                  <div className="size-12 md:size-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500">
                    <img
                      src={logo}
                      alt={company.empresa_nombre}
                      className="size-8 md:size-10 object-contain"
                    />
                  </div>

                  <div className="flex-1">
                    <CardTitle className="text-lg md:text-2xl font-semibold text-white drop-shadow-lg line-clamp-2">
                      {company.empresa_nombre}
                    </CardTitle>
                  </div>
                </div>
              </Card>
            );
          })}
    </div>
  );
}
