import { Editor as CoreEditor } from '@tiptap/core';
import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import slugify from 'slugify';

type TableOfContentsItem = {
    id: string
    textContent: string
    level: number
    itemIndex: number
    isActive?: boolean
}

type TableOfContentsStorage = {
    content: TableOfContentsItem[]
}

export type TableOfContentsProps = {
    editor: CoreEditor;
    onItemClick?: () => void;
};

export const TableOfContents = memo(
    ({ editor, onItemClick }: TableOfContentsProps) => {
        const [data, setData] = useState<TableOfContentsStorage | null>(null);

        useEffect(() => {
            const handler = ({
                editor: currentEditor,
            }: {
                editor: CoreEditor;
            }) => {
                const content: TableOfContentsItem[] = []
                let itemIndex = 0
                
                currentEditor.state.doc.descendants((node) => {
                    if (node.type.name === 'heading') {
                        itemIndex++
                        content.push({
                            id: slugify(node.textContent, { lower: true }),
                            textContent: node.textContent,
                            level: node.attrs.level,
                            itemIndex,
                            isActive: false,
                        })
                    }
                })
                
                setData({ content })
            };

            handler({ editor });

            editor.on('update', handler);
            editor.on('selectionUpdate', handler);

            return () => {
                editor.off('update', handler);
                editor.off('selectionUpdate', handler);
            };
        }, [editor]);

        return (
            <>
                {data && data.content.length > 0 ? (
                    <div className="flex flex-col gap-1 overflow-hidden pr-4">
                        {data.content.map(item => (
                            <a
                                key={item.id}
                                href={`#${slugify(item.textContent, { lower: true })}`}
                                style={{
                                    marginLeft: `${1 * item.level - 1}rem`,
                                }}
                                onClick={onItemClick}
                                className={cn(
                                    'block font-medium text-neutral-500 dark:text-neutral-300 p-1 rounded bg-opacity-10 text-sm hover:text-neutral-800 transition-all hover:bg-black hover:bg-opacity-5 truncate w-full',
                                    item.isActive &&
                                        'text-neutral-800 bg-neutral-100 dark:text-neutral-100 dark:bg-neutral-900',
                                )}
                            >
                                {item.itemIndex}. {item.textContent}
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-neutral-500">
                        Start adding headlines to your document …
                    </div>
                )}
            </>
        );
    },
);

TableOfContents.displayName = 'TableOfContents';
