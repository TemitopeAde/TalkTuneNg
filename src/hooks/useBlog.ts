import { useQuery } from "@tanstack/react-query";

interface Blog {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string;
    category: string;
    createdAt: string;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalBlogs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface BlogsResponse {
    success: boolean;
    data: {
        blogs: Blog[];
        pagination: PaginationData;
    };
}

interface GetBlogsParams {
    category?: string;
    page?: number;
    limit?: number;
}

const fetchBlogs = async (params: GetBlogsParams): Promise<BlogsResponse> => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category && params.category !== 'view-all') {
        queryParams.append('category', params.category);
    }

    const response = await fetch(`/api/blogs?${queryParams.toString()}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blogs');
    }

    return response.json();
};

export const useBlogs = (params: GetBlogsParams = {}) => {
    const defaultParams = {
        page: 1,
        limit: 9,
        ...params,
    };

    return useQuery({
        queryKey: ['blogs', defaultParams],
        queryFn: () => fetchBlogs(defaultParams),
        staleTime: 1000 * 60 * 5,
    });
};

const fetchBlogBySlug = async (slug: string) => {
    const response = await fetch(`/api/blogs/${slug}`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch blog');
    }

    return response.json();
};

export const useBlog = (slug: string) => {
    return useQuery({
        queryKey: ['blog', slug],
        queryFn: () => fetchBlogBySlug(slug),
        staleTime: 1000 * 60 * 5,
        enabled: !!slug,
    });
};