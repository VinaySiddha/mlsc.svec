'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Code, Link as LinkIcon, Heading2, Quote, Undo, Redo } from 'lucide-react';
import { useCallback } from 'react';

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string, plainText: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content = '', onChange, placeholder = 'Write something...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-[#4285F4] underline font-bold' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[160px] p-4 focus:outline-none text-black bg-white font-sans',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btnClass = (isActive: boolean) =>
    `h-8 px-2.5 flex items-center justify-center border-2 border-black text-xs font-black transition-all ${
      isActive
        ? 'bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]'
        : 'bg-white text-black hover:bg-zinc-100'
    }`;

  return (
    <div className="border-2 border-black bg-white shadow-[3px_3px_0px_0px_#000000]">
      <div className="flex flex-wrap gap-1.5 border-b-2 border-black p-2 bg-[#F9F9FB]">
        <button
          type="button"
          className={btnClass(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
        >
          <Heading2 className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('blockquote'))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Quote"
        >
          <Quote className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('codeBlock'))}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className={btnClass(editor.isActive('link'))}
          onClick={setLink}
          title="Insert Link"
        >
          <LinkIcon className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          className="h-8 px-2 border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-40"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
        <button
          type="button"
          className="h-8 px-2 border-2 border-black bg-white hover:bg-zinc-100 disabled:opacity-40"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

