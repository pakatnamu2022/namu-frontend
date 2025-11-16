import { useQuery } from "@tanstack/react-query";
import { PERSON_SEGMENT } from "./personSegment.constants";
import {
  PersonSegmentResource,
  PersonSegmentResponse,
} from "./personSegment.interface";
import {
  findPersonSegmentById,
  getAllPersonSegment,
  getPersonSegment,
} from "./personSegment.actions";

const { QUERY_KEY } = PERSON_SEGMENT;

export const usePersonSegment = (params?: Record<string, any>) => {
  return useQuery<PersonSegmentResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPersonSegment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllPersonSegment = (params?: Record<string, any>) => {
  return useQuery<PersonSegmentResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllPersonSegment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const usePersonSegmentById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findPersonSegmentById(id),
    refetchOnWindowFocus: false,
  });
};
