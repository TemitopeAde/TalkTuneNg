"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: (failureCount, error: any) => {
              // Don't retry on 401 errors
              if (error?.response?.status === 401 || error?.message?.includes('401')) {
                return false;
              }
              return failureCount < 1;
            },
            onError: (error: any) => {
              // Handle 401 errors globally for queries too
              if (error?.response?.status === 401 || error?.message?.includes('Invalid or expired token')) {
                toast.error('Your session has expired. Please login again.');
                const { logout } = useUserStore.getState();
                logout();
                window.location.href = '/auth/login';
              }
            },
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on 401 errors
              if (error?.response?.status === 401 || error?.message?.includes('401')) {
                return false;
              }
              return failureCount < 1;
            },
            onError: (error: any) => {
              // Handle 401 errors globally
              if (error?.response?.status === 401 || error?.message?.includes('Invalid or expired token')) {
                toast.error('Your session has expired. Please login again.');
                const { logout } = useUserStore.getState();
                logout();
                window.location.href = '/auth/login';
              }
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}