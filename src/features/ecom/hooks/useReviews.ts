import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { ecomApi } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiReviewToFe } from "@/lib/mappers/ecom.mapper";

export function useReviews() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.reviews(),
    queryFn: async () => {
      const data = await ecomApi.listReviews();
      return { ...data, items: data.items.map(mapApiReviewToFe) };
    },
    enabled,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      productId: number;
      rating: number;
      content?: string;
      reviewerName?: string;
      avatarUrl?: string;
      imageUrls?: string[];
      productNames?: string[];
    }) => ecomApi.createReview(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.reviews(),
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ecomApi.deleteReview(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.reviews(),
      });
    },
  });
}