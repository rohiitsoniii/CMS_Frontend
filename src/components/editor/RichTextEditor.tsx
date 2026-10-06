import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    List,
    ListOrdered,
    Image as ImageIcon,
    ExternalLink,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4 border rounded-b-md',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const handleInsertImage = () => {
        if (imageUrl.trim()) {
            editor.chain().focus().setImage({ src: imageUrl.trim(), alt: imageAlt.trim() || undefined }).run();
            setImageUrl('');
            setImageAlt('');
            setImageModalOpen(false);
        }
    };

    return (
        <div className="w-full flex flex-col">
            <div className="flex flex-wrap gap-1 p-2 border border-b-0 rounded-t-md bg-gray-50 dark:bg-gray-900">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <Bold className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <Italic className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <Strikethrough className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <Heading1 className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <Heading2 className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <List className="w-4 h-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-800' : ''}
                >
                    <ListOrdered className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1 self-center" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageModalOpen(true)}
                    title="Insert Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </Button>
            </div>

            <EditorContent editor={editor} />

            {/* Custom Image Insertion Dialog */}
            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-indigo-500" />
                            Insert Image
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="image-url">Image URL</Label>
                            <Input
                                id="image-url"
                                placeholder="https://images.unsplash.com/photo-..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image-alt">Alt Text (Optional)</Label>
                            <Input
                                id="image-alt"
                                placeholder="Describe the image for accessibility"
                                value={imageAlt}
                                onChange={(e) => setImageAlt(e.target.value)}
                            />
                        </div>

                        {imageUrl.trim() && (
                            <div className="mt-2 border rounded-lg p-2 bg-slate-50 dark:bg-slate-900">
                                <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                                    <ExternalLink className="w-3 h-3" /> Preview
                                </p>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-h-32 rounded object-cover mx-auto"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImageModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleInsertImage}
                            disabled={!imageUrl.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Insert Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
