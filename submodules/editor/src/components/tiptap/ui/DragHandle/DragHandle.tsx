import { Editor } from '@tiptap/react';
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';

type DragHandleProps = {
    editor: Editor;
    pluginKey?: string;
    onNodeChange?: (props: { node: Node; pos: number }) => void;
    tippyOptions?: {
        offset?: [number, number];
        zIndex?: number;
    };
    children: ReactNode;
};

export const DragHandle = ({
    editor,
    onNodeChange,
    tippyOptions = {},
    children,
}: DragHandleProps) => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const [currentNode, setCurrentNode] = useState<{ node: Node; pos: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const updatePosition = useCallback(() => {
        const { from } = editor.state.selection;
        const $from = editor.state.doc.resolve(from);
        
        let node: Node | null = null;
        let pos = from;

        for (let depth = $from.depth; depth > 0; depth--) {
            const parentNode = $from.node(depth);
            if (parentNode.type.name === 'paragraph' || parentNode.type.name === 'heading') {
                node = parentNode;
                pos = $from.before(depth);
                break;
            }
        }

        if (!node) return;

        const coords = editor.view.coordsAtPos(pos);
        
        setPosition({
            top: coords.top - (containerRef.current?.offsetHeight || 0) / 2,
            left: coords.left - (containerRef.current?.offsetWidth || 40) - 8,
        });

        if (onNodeChange) {
            setCurrentNode({ node, pos });
            onNodeChange({ node, pos });
        }
    }, [editor, onNodeChange]);

    useEffect(() => {
        const handleUpdate = () => {
            updatePosition();
        };

        editor.on('selectionUpdate', handleUpdate);
        editor.on('update', handleUpdate);

        return () => {
            editor.off('selectionUpdate', handleUpdate);
            editor.off('update', handleUpdate);
        };
    }, [editor, updatePosition]);

    if (!position || editor.state.selection.empty) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                zIndex: tippyOptions.zIndex || 99,
            }}
            className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-sm"
        >
            {children}
        </div>
    );
};

export default DragHandle;
