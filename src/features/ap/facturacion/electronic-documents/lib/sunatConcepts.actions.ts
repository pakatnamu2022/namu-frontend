// import { AxiosRequestConfig } from "axios";
// import { api } from "@/src/core/api";
// import { SunatConcept } from "./electronicDocument.types";

// const ENDPOINT = "/api/gp/mg/sunatConcepts";

// export interface GetSunatConceptsParams {
//   type: string;
//   status?: number;
//   search?: string;
// }

// export async function getSunatConcepts(
//   params: GetSunatConceptsParams
// ): Promise<SunatConcept[]> {
//   const config: AxiosRequestConfig = {
//     params: {
//       ...params,
//       status: params.status ?? 1, // Default to active
//     },
//   };
//   const { data } = await api.get<SunatConcept[]>(ENDPOINT, config);
//   return data;
// }

// Specific fetchers for each concept type
// export async function getDocumentTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_DOCUMENT_TYPE", status: 1 });
// }

// export async function getTransactionTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_TRANSACTION_TYPE", status: 1 });
// }

// export async function getIdentityDocumentTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "TYPE_DOCUMENT", status: 1 });
// }

// export async function getCurrencyTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_CURRENCY", status: 1 });
// }

// export async function getIgvTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_IGV_TYPE", status: 1 });
// }

// export async function getDetractionTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_DETRACTION_TYPE", status: 1 });
// }

// export async function getCreditNoteTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_CREDIT_NOTE_TYPE", status: 1 });
// }

// export async function getDebitNoteTypes(): Promise<SunatConcept[]> {
//   return getSunatConcepts({ type: "BILLING_DEBIT_NOTE_TYPE", status: 1 });
// }
