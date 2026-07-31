import { Icon } from '@/components/tiptap/ui/Icon';
import { Toolbar } from '@/components/tiptap/ui/Toolbar';
import { Button } from '@/components/ui/button.tsx';
import { SyncStateType } from '@/types.ts';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export type EditorHeaderProps = {
    isSidebarOpen?: boolean;
    toggleSidebar?: () => void;
    syncState?: SyncStateType;
    backPath: string;
    buttons: ReactNode;
    status: string;
    isRedirected?: boolean;
    warningText?: string;
};

export const EditorHeader = ({
    isSidebarOpen,
    toggleSidebar,
    syncState,
    backPath,
    buttons,
    status,
    isRedirected = false,
    warningText,
}: EditorHeaderProps) => {
    return (
        <div className="flex flex-row items-center justify-between flex-none py-2 pl-6 pr-3 text-black bg-white border-b border-neutral-200 dark:bg-black dark:text-white dark:border-neutral-800">
            <div className={'flex items-center gap-x-4'}>
                <Button href={backPath} variant={'ghost'}>
                    <div>
                        <Icon name="ChevronLeft" />
                    </div>
                    <p className={'text-xs'}>Exit</p>
                </Button>
                <div
                    className={
                        'rounded-lg bg-gray-50 px-3 flex items-center justify-between border h-7'
                    }
                >
                    <span
                        className={
                            'text-xs text-neutral-500 capitalize font-bold'
                        }
                    >
                        {status}
                    </span>

                    <div className={'h-full w-px bg-neutral-200 mx-2'} />

                    <div className="flex items-center gap-x-2">
                        <span className="text-xs text-neutral-500 capitalize">
                            {syncState}
                        </span>
                        <div
                            className={cn('w-2 h-2 rounded-full', {
                                'bg-yellow-500 dark:bg-yellow-400':
                                    syncState === 'syncing',
                                'bg-green-500 dark:bg-green-400':
                                    syncState === 'synced',
                                'bg-red-500 dark:bg-red-400':
                                    syncState === 'error',
                            })}
                        />
                    </div>
                </div>
                {isRedirected && (
                    <div
                        className={
                            'rounded-lg bg-amber-50 border border-amber-200 px-3 flex items-center h-7'
                        }
                        title="This post redirects elsewhere and is excluded from the sitemap and listing pages. Manage it in the SEO tab."
                    >
                        <Icon
                            name="CornerUpRight"
                            className="w-3 h-3 text-amber-700 mr-1.5"
                        />
                        <span className={'text-xs text-amber-700 font-bold'}>
                            Redirected
                        </span>
                    </div>
                )}
            </div>
            {!!warningText && (
                <p
                    className={'text-xs font-medium text-gray-500 text-center'}
                    style={{ whiteSpace: 'pre-line' }}
                >
                    {warningText}
                </p>
            )}
            <div className="flex flex-row gap-x-2 items-center">
                {buttons}
                <Toolbar.Button
                    tooltip={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    onClick={toggleSidebar}
                    active={isSidebarOpen}
                    className={isSidebarOpen ? 'bg-transparent' : ''}
                >
                    <Icon
                        name={isSidebarOpen ? 'PanelLeftClose' : 'PanelLeft'}
                    />
                </Toolbar.Button>
            </div>
        </div>
    );
};
