"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { AssignmentType } from "@/features/gp/tics/assignments/lib/assignments.interface";
import {
  useEquipmentAssignments,
  usePhoneLineAssignments,
} from "@/features/gp/tics/assignments/lib/assignments.hook";
import AssignmentsTable from "@/features/gp/tics/assignments/components/AssignmentsTable";
import AssignmentsActions from "@/features/gp/tics/assignments/components/AssignmentsActions";
import AssignmentsOptions from "@/features/gp/tics/assignments/components/AssignmentsOptions";
import { equipmentAssignmentColumns } from "@/features/gp/tics/assignments/components/EquipmentAssignmentColumns";
import { phoneLineAssignmentColumns } from "@/features/gp/tics/assignments/components/PhoneLineAssignmentColumns";
import BulkEquipmentAssignModal from "@/features/gp/tics/assignments/components/BulkEquipmentAssignModal";
import PhoneLineAssignModal from "@/features/gp/tics/assignments/components/PhoneLineAssignModal";
import PhoneLineUnassignModal from "@/features/gp/tics/assignments/components/PhoneLineUnassignModal";
import EquipmentUnassignModal from "@/features/gp/tics/assignments/components/EquipmentUnassignModal";
import PhoneLineLinkEquipmentModal from "@/features/gp/tics/assignments/components/PhoneLineLinkEquipmentModal";
import EquipmentLinkPhoneLineModal from "@/features/gp/tics/assignments/components/EquipmentLinkPhoneLineModal";
import {
  PhoneLineWorkerResource,
  EquipmentAssignmentResource,
} from "@/features/gp/tics/assignments/lib/assignments.interface";

export default function AssignmentsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [type, setType] = useState<AssignmentType>("equipment");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [unassignOpen, setUnassignOpen] = useState(false);
  const [selectedPhoneLine, setSelectedPhoneLine] = useState<PhoneLineWorkerResource | null>(null);
  const [equipmentUnassignOpen, setEquipmentUnassignOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentAssignmentResource | null>(null);
  const [linkEquipmentOpen, setLinkEquipmentOpen] = useState(false);
  const [selectedPhoneLineForLink, setSelectedPhoneLineForLink] = useState<PhoneLineWorkerResource | null>(null);
  const [linkPhoneLineOpen, setLinkPhoneLineOpen] = useState(false);
  const [selectedEquipmentForLink, setSelectedEquipmentForLink] = useState<EquipmentAssignmentResource | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, type]);

  const equipmentQuery = useEquipmentAssignments(
    type === "equipment" ? { page, per_page, search } : undefined,
  );

  const phoneLineQuery = usePhoneLineAssignments(
    type === "phoneLine" ? { page, per_page, search } : undefined,
  );

  const isLoading =
    type === "equipment" ? equipmentQuery.isLoading : phoneLineQuery.isLoading;

  const totalPages =
    type === "equipment"
      ? equipmentQuery.data?.meta?.last_page ?? 1
      : phoneLineQuery.data?.meta?.last_page ?? 1;

  const totalData =
    type === "equipment"
      ? equipmentQuery.data?.meta?.total ?? 0
      : phoneLineQuery.data?.meta?.total ?? 0;

  const handleSuccess = () => {
    if (type === "equipment") {
      equipmentQuery.refetch();
    } else {
      phoneLineQuery.refetch();
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("asignaciones")) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <AssignmentsActions
          type={type}
          onTypeChange={(newType) => {
            setType(newType);
            setSearch("");
          }}
          onAdd={() => setAddOpen(true)}
        />
      </HeaderTableWrapper>

      {type === "equipment" ? (
        <AssignmentsTable
          isLoading={isLoading}
          columns={equipmentAssignmentColumns(
            (row) => {
              setSelectedEquipment(row);
              setEquipmentUnassignOpen(true);
            },
            (row) => {
              setSelectedEquipmentForLink(row);
              setLinkPhoneLineOpen(true);
            },
          )}
          data={equipmentQuery.data?.data ?? []}
        >
          <AssignmentsOptions search={search} setSearch={setSearch} />
        </AssignmentsTable>
      ) : (
        <AssignmentsTable
          isLoading={isLoading}
          columns={phoneLineAssignmentColumns(
            (row) => {
              setSelectedPhoneLine(row);
              setUnassignOpen(true);
            },
            (row) => {
              setSelectedPhoneLineForLink(row);
              setLinkEquipmentOpen(true);
            },
          )}
          data={phoneLineQuery.data?.data ?? []}
        >
          <AssignmentsOptions search={search} setSearch={setSearch} />
        </AssignmentsTable>
      )}

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={totalData}
      />

      {type === "equipment" && (
        <BulkEquipmentAssignModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {type === "phoneLine" && (
        <PhoneLineAssignModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {selectedEquipment && (
        <EquipmentUnassignModal
          open={equipmentUnassignOpen}
          assignmentId={selectedEquipment.id}
          onClose={() => {
            setEquipmentUnassignOpen(false);
            setSelectedEquipment(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {selectedPhoneLine && (
        <PhoneLineUnassignModal
          open={unassignOpen}
          assignmentId={selectedPhoneLine.id}
          onClose={() => {
            setUnassignOpen(false);
            setSelectedPhoneLine(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {selectedPhoneLineForLink && (
        <PhoneLineLinkEquipmentModal
          open={linkEquipmentOpen}
          assignment={selectedPhoneLineForLink}
          onClose={() => {
            setLinkEquipmentOpen(false);
            setSelectedPhoneLineForLink(null);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {selectedEquipmentForLink && (
        <EquipmentLinkPhoneLineModal
          open={linkPhoneLineOpen}
          assignment={selectedEquipmentForLink}
          onClose={() => {
            setLinkPhoneLineOpen(false);
            setSelectedEquipmentForLink(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
