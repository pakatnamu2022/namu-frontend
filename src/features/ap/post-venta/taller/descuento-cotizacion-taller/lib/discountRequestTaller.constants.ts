const ROUTE_TALLER = "cotizacion-taller";
const ABSOLUTE_ROUTE_TALLER = `/ap/post-venta/taller/${ROUTE_TALLER}`;

export const DISCOUNT_REQUEST_TALLER = {
  QUERY_KEY: "discount-request-work-order-quotation",
  ROUTE_REQUEST_DISCOUNT: `${ABSOLUTE_ROUTE_TALLER}/solicitar-descuento`,
};

export const TYPE_GLOBAL = "GLOBAL";
export const TYPE_PARTIAL = "PARTIAL";
