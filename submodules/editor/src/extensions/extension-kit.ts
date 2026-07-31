import { HocuspocusProvider } from '@hocuspocus/provider';

import {
    BlockquoteFigure,
    CharacterCount,
    Color,
    Column,
    Columns,
    Document,
    Dropcursor,
    emojiSuggestion,
    Figcaption,
    Focus,
    FontFamily,
    FontSize,
    Heading,
    Highlight,
    HorizontalRule,
    ImageBlock,
    Link,
    Placeholder,
    Selection,
    SlashCommand,
    StarterKit,
    Subscript,
    Superscript,
    Table,
    TableCell,
    TableHeader,
    TableRow,
    TaskItem,
    TaskList,
    TextAlign,
    TextStyle,
    TrailingNode,
    Typography,
    Underline,
} from '.';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { ImageUpload } from './ImageUpload';
import { TableOfContentsNode } from './TableOfContentsNode';
import { lowlight } from 'lowlight';
import slugify from 'slugify';
import { debounce } from 'next/dist/server/utils';
import { API as APIUtils } from '@/lib/api';
import toast from 'react-hot-toast';
import { TweetEmbed } from '@/extensions/TwitterEmbed/TwitterEmbed.tsx';
import { Youtube } from '@tiptap/extension-youtube';
import { ExtendedYoutube } from '@/extensions/ExtendedYoutube';

type ExtensionKitProps = {
    provider?: HocuspocusProvider | null;
    getUploadImagePath: () => Promise<string | undefined>;
};

export const ExtensionKit = ({
    provider,
    getUploadImagePath,
}: ExtensionKitProps) => {
    return [
        Document,
        Columns,
        TaskList,
        TaskItem.configure({
            nested: true,
        }),
        Column,
        Selection,
        HorizontalRule,
        TweetEmbed,
        ExtendedYoutube.configure({
            controls: false,
            nocookie: true,
        }),
        StarterKit.configure({
            document: false,
            dropcursor: false,
            heading: false,
            horizontalRule: false,
            blockquote: false,
            //@ts-expect-error IDK
            history: true,
            codeBlock: false,
        }),
        Heading.configure({
            levels: [2, 3, 4, 5, 6],
        }),
        CodeBlockLowlight.configure({
            lowlight,
            defaultLanguage: null,
        }),
        TextStyle,
        FontSize,
        FontFamily,
        Color,
        TrailingNode,
        Link.configure({
            openOnClick: false,
        }),
        Highlight.configure({ multicolor: true }),
        Underline,
        CharacterCount.configure({ limit: 50000 }),
        TableOfContentsNode,
        ImageUpload.configure({
            clientId: provider?.document?.clientID,
        }),
        ImageBlock,
        TextAlign.extend({
            addKeyboardShortcuts() {
                return {};
            },
        }).configure({
            types: ['heading', 'paragraph'],
        }),
        Subscript,
        Superscript,
        Table,
        TableCell,
        TableHeader,
        TableRow,
        Typography,
        Placeholder.configure({
            includeChildren: true,
            showOnlyCurrent: false,
            placeholder: () => '',
        }),
        SlashCommand,
        Focus,
        Figcaption,
        BlockquoteFigure,
        Dropcursor.configure({
            width: 2,
            class: 'ProseMirror-dropcursor border-black',
        }),
    ];
};

export default ExtensionKit;
