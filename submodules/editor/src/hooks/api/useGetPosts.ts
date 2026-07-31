import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api.ts';
import { API } from '@/types.ts';
import { useMainContext } from '@/App.tsx';

const queryFn = async (pageId: number, excludeId?: number) => {
    return api
        .get(`/pages/${pageId}/posts`, { params: { exclude_id: excludeId } })
        .then(response => response.data);
};

type UseGetPostsProps = {
    // Keeps the current post out of its own redirect picker.
    excludeCurrent?: boolean;
    enabled?: boolean;
};

export const useGetPosts = ({
    excludeCurrent = false,
    enabled = true,
}: UseGetPostsProps = {}) => {
    const { post } = useMainContext();
    const excludeId = excludeCurrent ? post.id : undefined;

    const { data, isLoading, isRefetching, ...rest } = useQuery<
        API.PostSummary[]
    >({
        queryKey: ['posts', post.page_id, excludeId ?? null],
        queryFn: () => queryFn(post.page_id, excludeId),
        enabled,
    });

    return {
        posts: data ?? [],
        isLoading: isLoading || isRefetching,
        ...rest,
    };
};
