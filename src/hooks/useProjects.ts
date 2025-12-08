import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProjects, deleteProject } from '../services/storageService';
import { useState } from 'react';

export const useProjects = (userId?: string, folderId?: string | null, isArchived?: boolean) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Default to 12 items per page

  const projectsQuery = useQuery({
    queryKey: ['projects', userId, page, limit, folderId, isArchived],
    queryFn: () => getUserProjects(userId!, limit, page, folderId, isArchived),
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data to avoid stale folder views
    refetchInterval: 60 * 1000,
    placeholderData: (previousData, previousQuery) => {
      const oldKey = previousQuery?.queryKey;
      // Key structure: ['projects', userId, page, limit, folderId, isArchived]
      // Indices: 0, 1, 2, 3, 4, 5

      // If folderId (4) or isArchived (5) changed, do NOT use placeholder data.
      if (oldKey && (oldKey[4] !== folderId || oldKey[5] !== isArchived)) {
        return undefined;
      }
      return previousData;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', userId] });
    },
  });

  const data = projectsQuery.data || { projects: [], total: 0 };

  return {
    projects: data.projects,
    total: data.total,
    totalPages: Math.ceil(data.total / limit),
    page,
    setPage,
    limit,
    setLimit,
    isLoading: projectsQuery.isLoading,
    isFetching: projectsQuery.isFetching,
    isError: projectsQuery.isError,
    deleteProject: deleteMutation.mutateAsync,
    refreshProjects: () => queryClient.invalidateQueries({ queryKey: ['projects', userId] }),
    isDeleting: deleteMutation.isPending
  };
};