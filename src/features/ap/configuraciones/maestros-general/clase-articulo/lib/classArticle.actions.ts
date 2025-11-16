import { AxiosRequestConfig } from "axios";
import {
  ClassArticleResource,
  ClassArticleResponse,
  getClassArticleProps,
} from "./classArticle.interface";
import { api } from "@/src/core/api";
import { STATUS_ACTIVE } from "@/src/core/core.constants";
import { CLASS_ARTICLE } from "./classArticle.constants";

const { ENDPOINT } = CLASS_ARTICLE;

export async function getClassArticle({
  params,
}: getClassArticleProps): Promise<ClassArticleResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<ClassArticleResponse>(ENDPOINT, config);
  return data;
}

export async function getAllClassArticle({
  params,
}: getClassArticleProps): Promise<ClassArticleResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<ClassArticleResource[]>(ENDPOINT, config);
  return data;
}

export async function findClassArticleById(
  id: number
): Promise<ClassArticleResource> {
  const response = await api.get<ClassArticleResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeClassArticle(
  data: any
): Promise<ClassArticleResource> {
  const response = await api.post<ClassArticleResource>(ENDPOINT, data);
  return response.data;
}

export async function updateClassArticle(
  id: number,
  data: any
): Promise<ClassArticleResource> {
  const response = await api.put<ClassArticleResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteClassArticle(
  id: number
): Promise<ClassArticleResponse> {
  const { data } = await api.delete<ClassArticleResponse>(`${ENDPOINT}/${id}`);
  return data;
}
