"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchNotifications = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    `/api/notifications?page=${pageParam}&limit=10`
  );
  return res.data;
};

export const useNotifications = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length ? pages.length + 1 : null;
    },
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isError,
  };
};
