"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { TelephoneAccountForm } from "./TelephoneAccountForm";
import { useState } from "react";
import { errorToast, successToast } from "@/core/core.function";
import {
  storeTelephoneAccount,
  updateTelephoneAccount,
  findTelephoneAccountById,
} from "../lib/telephoneAccount.actions";
import { useAllCompanies } from "@/features/gp/gestionsistema/empresa/lib/company.hook";
import { useEffect } from "react";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface TelephoneAccountModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId?: string | null;
}

export default function TelephoneAccountModal({
  open,
  onClose,
  onSuccess,
  accountId,
}: TelephoneAccountModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultValues, setDefaultValues] = useState<any>({});
  const { data: companies = [], isLoading: isLoadingCompanies } =
    useAllCompanies();

  const isEditMode = !!accountId;

  useEffect(() => {
    if (accountId && open) {
      setIsLoading(true);
      findTelephoneAccountById(accountId)
        .then((data) => {
          setDefaultValues({
            company_id: data.company_id.toString(),
            account_number: data.account_number,
            operator: data.operator,
          });
        })
        .catch(() => {
          errorToast("Error al cargar la cuenta telefónica.");
          onClose();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!accountId) {
      setDefaultValues({});
    }
  }, [accountId, open, onClose]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && accountId) {
        await updateTelephoneAccount(accountId, data);
        successToast("Cuenta telefónica actualizada correctamente.");
      } else {
        await storeTelephoneAccount(data);
        successToast("Cuenta telefónica creada correctamente.");
      }
      onSuccess();
      onClose();
    } catch (error) {
      errorToast(
        `Error al ${isEditMode ? "actualizar" : "crear"} la cuenta telefónica.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={
        isEditMode
          ? "Actualizar Cuenta Telefónica"
          : "Agregar Cuenta Telefónica"
      }
      subtitle={
        isEditMode
          ? "Editar información de la cuenta telefónica"
          : "Crear una nueva cuenta telefónica"
      }
      icon="CreditCard"
      size="lg"
    >
      {isLoading || isLoadingCompanies ? (
        <FormSkeleton />
      ) : (
        <TelephoneAccountForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode={isEditMode ? "update" : "create"}
          companies={companies}
          onCancel={onClose}
        />
      )}
    </GeneralModal>
  );
}
