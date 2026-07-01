import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/features/auth/hooks/useAuthQueryEnabled";
import { ecomApi } from "@/lib/endpoints/ecom.api";
import { queryKeys } from "@/lib/query-keys";
import { mapApiCategoryToFe } from "@/lib/mappers/ecom.mapper";

export function useCategories() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.ecom.categories(),
    queryFn: async () => {
      const data = await ecomApi.listCategories();
      return { ...data, items: data.items.map(mapApiCategoryToFe) };
    },
    enabled,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      imageUrl?: string;
      parentId?: string | null;
      visible?: boolean;
    }) =>
      ecomApi.createCategory({
        name: payload.name,
        imageUrl: payload.imageUrl || undefined,
        parentId: payload.parentId ? Number(payload.parentId) : null,
        visible: payload.visible ?? true,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.categories(),
      });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      visible,
    }: {
      id: number;
      visible: boolean;
    }) => ecomApi.updateCategory(id, { visible }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.categories(),
      });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ecomApi.deleteCategory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.ecom.categories(),
      });
    },
  });
}