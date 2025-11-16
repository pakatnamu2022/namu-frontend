"use client";

import { notFound } from "next/navigation";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import DistrictActions from "@/src/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictActions";
import DistrictTable from "@/src/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictTable";
import { districtColumns } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictColumns";
import DistrictOptions from "@/src/features/ap/configuraciones/maestros-general/ubigeos/components/DistrictOptions";
import { useDistrict } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/lib/district.hook";
import { deleteDistrict } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/lib/district.actions";
import { DISTRICT } from "@/src/features/ap/configuraciones/maestros-general/ubigeos/lib/district.constants";
import {
  useAllDepartment,
  useAllProvince,
} from "@/src/features/gp/gestionsistema/ubicaciones/lib/location.hook";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function DistrictPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [provinceId, setProvinceId] = useState<string>("");
  const { MODEL, ROUTE } = DISTRICT;
  const permissions = useModulePermissions(ROUTE);

  const { data: departments = [] } = useAllDepartment();
  const { data: provinces = [] } = useAllProvince();
  const filteredProvinces = departmentId
    ? provinces.filter(
        (province) => province.department_id?.toString() === departmentId
      )
    : provinces;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  useEffect(() => {
    setProvinceId("");
  }, [departmentId]);

  const { data, isLoading, refetch } = useDistrict({
    page,
    search,
    per_page,
    province_id: provinceId,
    province$department_id: departmentId,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDistrict(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <DistrictActions permissions={permissions} />
      </HeaderTableWrapper>
      <DistrictTable
        isLoading={isLoading}
        columns={districtColumns({
          onDelete: setDeleteId,
          permissions,
        })}
        data={data?.data || []}
      >
        <DistrictOptions
          search={search}
          setSearch={setSearch}
          departments={departments}
          departmentId={departmentId}
          setDepartmentId={setDepartmentId}
          provinces={filteredProvinces}
          provinceId={provinceId}
          setProvinceId={setProvinceId}
        />
      </DistrictTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
