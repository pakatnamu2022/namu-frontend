"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/src/features/auth/lib/auth.store";
import CardSkeletonGrid from "@/src/shared/components/CardSkeletonGrid";
import { CONSTANTS } from "@/src/core/core.constants";

export default function AvailableCompanies() {
  const router = useRouter();
  const { permissions } = useAuthStore();

  const handleCompanySelect = (company: string) => {
    router.push(`/modules/${company}`);
  };

  // useEffect(() => {
  //   if (permissions && permissions?.length === 1) {
  //     handleCompanySelect(permissions[0].empresa_abreviatura);
  //   }
  // }, [permissions, router]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
      {permissions?.length === 0
        ? Array.from({ length: 4 }, (_, index) => (
            <CardSkeletonGrid key={index} />
          ))
        : permissions?.map((company, index) => {
            const logo =
              CONSTANTS.EMPRESAS.find((c: any) => c.id === company.empresa_id)
                ?.scrWhite || "/logos/default.svg";
            return (
              <Card
                key={company.empresa_id}
                className="group hover:shadow-xl transition-all duration-500 cursor-pointer border bg-background backdrop-blur-xs hover:scale-[1.02] relative overflow-hidden"
                onClick={() => handleCompanySelect(company.empresa_abreviatura)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="text-center relative z-10 flex-row gap-4 md:gap-6 space-y-0 p-4">
                  <div className="relative">
                    <div className="size-14 md:size-20 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-all duration-500 shadow-lg text-white bg-primary">
                      <div className="size-10 md:size-16 relative">
                        <Image
                          src={logo}
                          alt={company.empresa_nombre}
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center items-start md:gap-1">
                    <CardTitle className="text-base md:text-lg font-bold text-primary dark:text-primary-foreground group-hover:text-primary transition-colors duration-300 text-start line-clamp-2">
                      {company.empresa_nombre}
                    </CardTitle>
                    <CardDescription className="text-xs md:text-base muted-foreground group-hover:text-gray-700 transition-colors duration-300 text-start line-clamp-1">
                      {/* {company.empresa_nombre} */}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
    </div>
  );
}
