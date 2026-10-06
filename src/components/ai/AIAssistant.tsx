import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sparkles,
    Wand2,
    Languages,
    Tag,
    FileText,
    Mail,
    Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AIAssistantProps {
    onContentGenerated?: (content: string) => void;
    onTagsGenerated?: (tags: string[]) => void;
    currentContent?: string;
}

export function AIAssistant({
    onContentGenerated,
    onTagsGenerated,
    currentContent = '',
}: AIAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState<string>('');
    const [input, setInput] = useState('');
    const [emailType, setEmailType] = useState('newsletter');
    const [result, setResult] = useState('');

    // Generate blog post
    const generateBlogMutation = useMutation({
        mutationFn: async (topic: string) => {
            const response = await fetch('/api/v1/ai/generate/blog-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic }),
            });
            const data = await response.json();
            return data.data;
        },
        onSuccess: (data) => {
            setResult(data.content);
            toast.success('Blog post generated!');
        },
        onError: () => {
            toast.error('Failed to generate blog post');
        },
    });

    // Generate tags
    const generateTagsMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await fetch('/api/v1/ai/seo/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, maxTags: 5 }),
            });
            const data = await response.json();
            return data.data.tags;
        },
        onSuccess: (tags) => {
            setResult(tags.join(', '));
            if (onTagsGenerated) onTagsGenerated(tags);
            toast.success('Tags generated!');
        },
        onError: () => {
            toast.error('Failed to generate tags');
        },
    });

    // Improve content
    const improveContentMutation = useMutation({
        mutationFn: async (content: string) => {
            const response = await fetch('/api/v1/ai/improve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            });
            const data = await response.json();
            return data.data.improvedContent;
        },
        onSuccess: (improved) => {
            setResult(improved);
            toast.success('Content improved!');
        },
        onError: () => {
            toast.error('Failed to improve content');
        },
    });

    // Translate content
    const translateMutation = useMutation({
        mutationFn: async ({ content, language }: { content: string; language: string }) => {
            const response = await fetch('/api/v1/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, targetLanguage: language }),
            });
            const data = await response.json();
            return data.data.translation;
        },
        onSuccess: (translation) => {
            setResult(translation);
            toast.success('Content translated!');
        },
        onError: () => {
            toast.error('Failed to translate content');
        },
    });

    // Generate meta description
    const generateMetaMutation = useMutation({
        mutationFn: async ({ title, content }: { title: string; content: string }) => {
            const response = await fetch('/api/v1/ai/seo/meta-description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            const data = await response.json();
            return data.data.metaDescription;
        },
        onSuccess: (meta) => {
            setResult(meta);
            toast.success('Meta description generated!');
        },
        onError: () => {
            toast.error('Failed to generate meta description');
        },
    });

    // Generate email
        const generateEmailMutation = useMutation({
            mutationFn: async ({ topic, type }: { topic: string; type: string }) => {
                const response = await fetch('/api/v1/ai/generate/email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic, type }),
                });
                const data = await response.json();
                return data.data;
            },
            onSuccess: (data) => {
                setResult(`SUBJECT: ${data.subject}\n\nPREHEADER: ${data.preheader}\n\n${data.content}`);
                toast.success('Email generated!');
            },
            onError: () => {
                toast.error('Failed to generate email');
            },
        });

        const handleGenerate = () => {
            switch (activeFeature) {
                case 'blog':
                    generateBlogMutation.mutate(input);
                    break;
                case 'email':
                    generateEmailMutation.mutate({ topic: input, type: emailType });
                    break;
                case 'tags':
                    generateTagsMutation.mutate(currentContent || input);
                    break;
                case 'improve':
                    improveContentMutation.mutate(currentContent || input);
                    break;
                case 'translate':
                    // For simplicity, translating to Spanish
                    translateMutation.mutate({ content: currentContent || input, language: 'Spanish' });
                    break;
                case 'meta':
                    generateMetaMutation.mutate({ title: input, content: currentContent });
                    break;
            }
        };

        const handleUseResult = () => {
            if (onContentGenerated && result) {
                onContentGenerated(result);
                setIsOpen(false);
                setResult('');
            }
        };

        const isLoading =
            improveContentMutation.isPending ||
            translateMutation.isPending ||
            generateMetaMutation.isPending ||
            generateEmailMutation.isPending;

        return(
        <>
            <Button
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="gap-2"
            >
                <Sparkles className="w-4 h-4" />
                AI Assistant
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            AI Assistant
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Feature Selection */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <Button
                                variant={activeFeature === 'blog' ? 'default' : 'outline'}
                                onClick={() => setActiveFeature('blog')}
                                className="flex items-center gap-2"
                            >
                                Generate Blog
                            </Button>
                            <Button
                                variant={activeFeature === 'email' ? 'default' : 'outline'}
                                onClick={() => setActiveFeature('email')}
                                className="flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Generate Email
                            </Button>
                            <Button
                                variant={activeFeature === 'tags' ? 'default' : 'outline'}
                                onClick={() => setActiveFeature('tags')}
                                className="flex items-center gap-2"
                            >
                                <Tag className="w-4 h-4" />
                                Generate Tags
                            </Button>
                            <Button
                                variant={activeFeature === 'improve' ? 'default' : 'outline'}
                                onClick={() => setActiveFeature('improve')}
                                className="flex items-center gap-2"
                            >
                                <Wand2 className="w-4 h-4" />
                                Improve Content
                            </Button>
                            <Button
                                variant={activeFeature === 'translate' ? 'default' : 'outline'}
                                onClick={() => setActiveFeature('translate')}
                                className="flex items-center gap-2"
                            >
                                <Languages className="w-4 h-4" />
                                Translate
                            </Button>
                            <Button
                                variant={activeFeature === 'meta' ? 'default' : 'outline'}
                                onClick={() => setActiveFeature('meta')}
                                className="flex items-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Meta Description
                            </Button>
                        </div>
                        {/* Email Type Selection */}
                        {activeFeature === 'email' && (
                            <div className="space-y-2">
                                <Label>Email Type</Label>
                                <Select value={emailType} onValueChange={setEmailType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newsletter">Newsletter</SelectItem>
                                        <SelectItem value="welcome">Welcome Email</SelectItem>
                                        <SelectItem value="promo">Promotional Email</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Input */}
                        {activeFeature && (
                            <div className="space-y-2">
                                <Label>
                                    {activeFeature === 'blog' && 'Blog Topic'}
                                    {activeFeature === 'email' && 'Email Topic / Subject'}
                                    {activeFeature === 'tags' && 'Content (or use current)'}
                                    {activeFeature === 'improve' && 'Content to Improve'}
                                    {activeFeature === 'translate' && 'Content to Translate'}
                                    {activeFeature === 'meta' && 'Page Title'}
                                </Label>
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        activeFeature === 'blog'
                                            ? 'e.g., Getting started with React'
                                            : activeFeature === 'email'
                                                ? 'e.g., Monthly product update'
                                                : activeFeature === 'meta'
                                                    ? 'Enter page title'
                                                : 'Enter content or leave empty to use current content'
                                    }
                                    rows={3}
                                />
                            </div>
                        )}

                        {/* Generate Button */}
                        {activeFeature && (
                            <Button
                                onClick={handleGenerate}
                                disabled={isLoading || (!input && !currentContent)}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Generate with AI
                                    </>
                                )}
                            </Button>
                        )}

                        {/* Result */}
                        {result && (
                            <Card className="p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                                <Label className="text-purple-800 dark:text-purple-200 mb-2 block">
                                    AI Generated Result:
                                </Label>
                                <div className="prose dark:prose-invert max-w-none">
                                    <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                                </div>
                            </Card>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        {result && (
                            <Button onClick={handleUseResult}>
                                Use This Content
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
