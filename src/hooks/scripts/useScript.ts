import { useState } from 'react';
import { uploadScript } from '@/lib/mutations/uploadScript';
import { GetScriptsParams, ScriptsResponse, UploadScriptDataFrontend, UploadScriptResponse, UseUploadScriptReturn } from '@/types';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";



export const useUploadScript = (): UseUploadScriptReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUploadScript = async (data: UploadScriptDataFrontend): Promise<UploadScriptResponse> => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadScript(data);
      setSuccess(true);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload script';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setIsLoading(false);
  };

  return {
    uploadScript: handleUploadScript,
    isLoading,
    error,
    success,
    reset,
  };
};

const fetchScripts = async (params: GetScriptsParams): Promise<ScriptsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.language) queryParams.append('language', params.language);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await fetch(`/api/scripts/fetch?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      const error: any = new Error('Invalid or expired token');
      error.response = { status: 401 };
      throw error;
    }
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch scripts');
  }

  return response.json();
};


export const useScripts = (params: GetScriptsParams = {}) => {
  const defaultParams = {
    page: 1,
    limit: 10,
    sortBy: 'createdAt' as const,
    sortOrder: 'desc' as const,
    ...params,
  };

  return useQuery({
    queryKey: ['scripts', defaultParams],
    queryFn: () => fetchScripts(defaultParams),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for invalidating scripts cache (useful after creating/updating/deleting scripts)
export const useInvalidateScripts = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['scripts'] });
  };
};