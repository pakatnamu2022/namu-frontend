import { ModelComplete } from "@/src/core/core.interface";
import { ClassArticleResource } from "./classArticle.interface";

const ROUTE = "clase-articulo";

export const CLASS_ARTICLE: ModelComplete<ClassArticleResource> = {
  MODEL: {
    name: "Clase de Artículo",
    plural: "Clases de Artículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/classArticle",
  QUERY_KEY: "classArticle",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    dyn_code: "",
    description: "",
    account: "",
    type: "",
    status: true,
  },
};
