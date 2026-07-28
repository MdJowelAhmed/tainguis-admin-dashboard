import { useEffect } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from 'lucide-react'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor px-4 py-3 text-sm text-gray-800',
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="rounded-xl border border-surface-border bg-white p-4 text-sm text-gray-400">
        Loading editor…
      </div>
    )
  }

  return (
    <div className="tiptap-wrapper overflow-hidden rounded-xl border border-surface-border bg-white">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-surface-border bg-surface-elevated px-2 py-1.5">
      <ToolButton
        icon={Heading1}
        label="Heading 1"
        active={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <ToolButton
        icon={Heading2}
        label="Heading 2"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolButton
        icon={Heading3}
        label="Heading 3"
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <Divider />
      <ToolButton
        icon={Bold}
        label="Bold"
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolButton
        icon={Italic}
        label="Italic"
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolButton
        icon={Strikethrough}
        label="Strikethrough"
        active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />
      <Divider />
      <ToolButton
        icon={List}
        label="Bullet list"
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolButton
        icon={ListOrdered}
        label="Numbered list"
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolButton
        icon={Quote}
        label="Blockquote"
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />
      <Divider />
      <ToolButton
        icon={Undo2}
        label="Undo"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
      />
      <ToolButton
        icon={Redo2}
        label="Redo"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
      />
    </div>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-surface-border" />
}

function ToolButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: LucideIcon
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        active
          ? 'bg-brand/10 text-brand'
          : 'text-gray-600 hover:bg-white hover:text-gray-900'
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon size={16} />
    </button>
  )
}
