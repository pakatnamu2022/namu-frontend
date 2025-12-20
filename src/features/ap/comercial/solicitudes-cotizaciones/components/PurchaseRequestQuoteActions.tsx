interface PurchaseRequestQuoteActionsProps {
  permissions: {
    canCreate: boolean;
  };
}

export default function PurchaseRequestQuoteActions({}: PurchaseRequestQuoteActionsProps) {
  // Las solicitudes de cotización ahora solo se crean desde la vista de oportunidades
  return null;
}
