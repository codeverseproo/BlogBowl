import { CommonTabProps } from '@/components/sidebar';
import SidebarTabWrapper, {
    SidebarChildrenWrapper,
} from '@/components/sidebar/SidebarTabWrapper.tsx';
import Input from '@/components/core/Input.tsx';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextArea from '@/components/core/TextArea.tsx';
import Divider from '@/components/core/Divider.tsx';
import { useEffect } from 'react';
import { useUpdatePost } from '@/hooks/api/useUpdatePost.ts';
import ImageUploadForm from '@/components/core/ImageUploadForm.tsx';
import { API } from '@/types.ts';
import { useGetPosts } from '@/hooks/api/useGetPosts.ts';
import SelectBase from '@/components/core/Select/SelectBase.tsx';
import { SelectItem } from '@/components/ui/select.tsx';

type RedirectMode = 'none' | 'post' | 'url';

type SeoSideBarForm = {
    slug: string;
    seoTitle: string;
    seoDescription: string;

    ogTitle: string;
    ogDescription: string;
    sharing_image: FileList;

    redirectMode: RedirectMode;
    redirectPostId: string;
    redirectUrl: string;
};

const redirectModeOf = (post?: API.Post | null): RedirectMode => {
    if (post?.redirect_post_id) return 'post';
    if (post?.redirect_url) return 'url';
    return 'none';
};

const SeoSidebarTab = ({ title }: CommonTabProps) => {
    const {
        updatePost,
        isLoading: isPostLoading,
        context: { post },
    } = useUpdatePost({
        successMessage: 'Post settings updated successfully',
        errorMessage: 'Failed to update post settings',
    });

    const {
        register,
        formState: { errors, isDirty },
        setValue,
        handleSubmit,
        clearErrors,
        watch,
        control,
    } = useForm<SeoSideBarForm>({
        // The redirect target fields are conditionally rendered; unregistering
        // them on unmount keeps their validation from firing for a mode the
        // user isn't in.
        shouldUnregister: true,
        defaultValues: {
            slug: post?.slug || '',
            seoTitle: post?.seo_title ?? (post?.title || ''),
            seoDescription: post?.seo_description ?? (post?.description || ''),
            ogTitle: post?.og_title ?? (post?.title || ''),
            ogDescription: post?.og_description ?? (post?.description || ''),
            redirectMode: redirectModeOf(post),
            redirectPostId: post?.redirect_post_id
                ? String(post.redirect_post_id)
                : '',
            redirectUrl: post?.redirect_url ?? '',
        },
    });

    const redirectMode = watch('redirectMode');

    // Only fetch the picker's options once the user actually chooses to
    // redirect to a post.
    const { posts, isLoading: arePostsLoading } = useGetPosts({
        excludeCurrent: true,
        enabled: redirectMode === 'post',
    });

    useEffect(() => {
        if (post?.slug) {
            setValue('slug', post.slug);
        }
    }, [post?.slug]);

    // Re-sync after a save so the form reflects what the server stored (e.g.
    // the redirect was cleared).
    useEffect(() => {
        setValue('redirectMode', redirectModeOf(post));
        setValue(
            'redirectPostId',
            post?.redirect_post_id ? String(post.redirect_post_id) : '',
        );
        setValue('redirectUrl', post?.redirect_url ?? '');
    }, [post?.redirect_post_id, post?.redirect_url]);

    const onSubmit: SubmitHandler<SeoSideBarForm> = async ({
        slug,
        seoTitle,
        seoDescription,
        ogTitle,
        ogDescription,
        sharing_image,
        redirectMode: mode,
        redirectPostId,
        redirectUrl,
    }) => {
        // The payload goes out as FormData, so clearing a field means sending
        // an empty string — `null` would serialize as the literal "null".
        const redirect =
            mode === 'post'
                ? { redirect_post_id: redirectPostId, redirect_url: '' }
                : mode === 'url'
                  ? { redirect_post_id: '', redirect_url: redirectUrl.trim() }
                  : { redirect_post_id: '', redirect_url: '' };

        await updatePost({
            slug,
            sharing_image,
            seo_title: seoTitle,
            seo_description: seoDescription,
            og_title: ogTitle,
            og_description: ogDescription,
            ...redirect,
        });
    };

    const currentImage = watch('sharing_image');

    return (
        <SidebarTabWrapper
            title={title}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={isPostLoading}
            isDirty={isDirty}
            warningMessage="⚠️ These settings will be published immediately and automatically override your current post configuration."
        >
            <SidebarChildrenWrapper>
                <Input
                    label="Post slug"
                    name={'slug'}
                    placeholder="Enter category name"
                    error={errors.slug}
                    {...{ register }}
                    isRequired
                />
                <Input
                    label="SEO title"
                    name={'seoTitle'}
                    placeholder="Enter SEO title"
                    error={errors.slug}
                    {...{ register }}
                />
                <TextArea
                    label={'SEO description'}
                    placeholder={'Enter SEO description'}
                    {...{ register }}
                    name={'seoDescription'}
                    rows={2}
                />
            </SidebarChildrenWrapper>
            <Divider className={'my-5'} />
            <SidebarChildrenWrapper>
                <p className={'font-bold'}>Open Graph</p>
                <Input
                    label="OG title"
                    name={'ogTitle'}
                    placeholder="Enter OG title"
                    error={errors.ogTitle}
                    {...{ register }}
                />
                <TextArea
                    label={'OG description'}
                    placeholder={'Enter OG description'}
                    {...{ register }}
                    name={'ogDescription'}
                    rows={2}
                />
                <ImageUploadForm
                    name={'sharing_image'}
                    register={register}
                    label={'OG image'}
                    setValue={setValue}
                    currentImage={currentImage}
                    // isRequired={true}
                    error={errors.sharing_image}
                    clearErrors={clearErrors}
                    defaultImage={post?.sharing_image ?? post?.cover_image}
                />
            </SidebarChildrenWrapper>
            <Divider className={'my-5'} />
            <SidebarChildrenWrapper>
                <p className={'font-bold'}>Redirect</p>
                <p className={'text-xs text-gray-500'}>
                    A redirected post permanently (301) sends visitors
                    elsewhere, and is dropped from the sitemap and all listing
                    pages.
                </p>
                <SelectBase
                    label={'Redirect this post'}
                    name={'redirectMode'}
                    control={control}
                    items={[
                        { label: 'No redirect', value: 'none' },
                        { label: 'To another post', value: 'post' },
                        { label: 'To a custom URL', value: 'url' },
                    ]}
                    renderItem={({ label, value }) => (
                        <SelectItem
                            value={value}
                            key={`redirect-mode-${value}`}
                            className={'px-3'}
                        >
                            {label}
                        </SelectItem>
                    )}
                />
                {redirectMode === 'post' && (
                    <SelectBase
                        label={'Target post'}
                        name={'redirectPostId'}
                        control={control}
                        disabled={arePostsLoading}
                        placeholder={
                            arePostsLoading
                                ? 'Loading posts...'
                                : 'Select a post'
                        }
                        items={posts.map(p => {
                            const name = p.title || p.slug;
                            return {
                                // Surface unpublished targets: redirecting to
                                // one lands visitors on a 404 until it ships.
                                label:
                                    p.status && p.status !== 'published'
                                        ? `${name} (${p.status})`
                                        : name,
                                value: String(p.id),
                            };
                        })}
                        renderItem={({ label, value }) => (
                            <SelectItem
                                value={value}
                                key={`redirect-post-${value}`}
                                className={'px-3'}
                            >
                                {label}
                            </SelectItem>
                        )}
                    />
                )}
                {redirectMode === 'url' && (
                    <Input
                        label="Target URL"
                        name={'redirectUrl'}
                        placeholder="https://example.com/article or /article"
                        error={errors.redirectUrl}
                        rules={{
                            pattern: {
                                value: /^(https?:\/\/\S+|\/\S*)$/,
                                message:
                                    '* Enter a full URL or a path starting with /',
                            },
                        }}
                        {...{ register }}
                        isRequired
                    />
                )}
            </SidebarChildrenWrapper>
        </SidebarTabWrapper>
    );
};

export default SeoSidebarTab;
