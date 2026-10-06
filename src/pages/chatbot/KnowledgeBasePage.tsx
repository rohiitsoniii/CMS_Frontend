import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MessageSquare,
    Brain,
    Loader2,
    Tag,
    ThumbsUp,
    ThumbsDown,
    Check,
    X,
    TestTube,
    Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { KnowledgeBaseSkeleton } from '@/components/skeletons';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { api } from '@/services/api';

interface KnowledgeEntry {
    _id: string;
    question: string;
    answer: string;
    category: string;
    keywords: string[];
    variations?: string[];
    status: 'active' | 'inactive' | 'draft';
    priority: number;
    metrics: {
        usageCount: number;
        helpfulCount: number;
        notHelpfulCount: number;
        lastUsedAt?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface Category {
    name: string;
    count: number;
}

interface TestResult {
    query: string;
    bestMatch?: {
        question: string;
        answer: string;
        score: number;
    };
    matches?: Array<{
        question: string;
        answer: string;
        score: number;
    }>;
}

export default function KnowledgeBasePage() {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [editDialog, setEditDialog] = useState<{ open: boolean; entry?: KnowledgeEntry }>({ open: false });
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; entry?: KnowledgeEntry }>({ open: false });
    const [testDialog, setTestDialog] = useState(false);
    const [testQuery, setTestQuery] = useState('');
    const [testResults, setTestResults] = useState<TestResult | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: 'general',
        keywords: '',
        priority: 0,
    });

    // Fetch knowledge entries
    const { data, isLoading } = useQuery({
        queryKey: ['knowledge', projectId, search, selectedCategory],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (selectedCategory) params.set('category', selectedCategory);
            const response = await api.get(`/projects/${projectId}/knowledge?${params}`);
            return response.data.data;
        },
        enabled: !!projectId,
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['knowledge-stats', projectId],
        queryFn: async () => {
            const response = await api.get(`/projects/${projectId}/knowledge/stats`);
            return response.data.data;
        },
        enabled: !!projectId,
    });

    // Create/Update mutation
    const saveMutation = useMutation({
        mutationFn: async (data: typeof formData & { id?: string }) => {
            const payload = {
                ...data,
                keywords: data.keywords.split(',').map(k => k.trim()).filter(Boolean),
            };

            if (data.id) {
                return api.put(`/projects/${projectId}/knowledge/${data.id}`, payload);
            }
            return api.post(`/projects/${projectId}/knowledge`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge', projectId] });
            queryClient.invalidateQueries({ queryKey: ['knowledge-stats', projectId] });
            setEditDialog({ open: false });
            setFormData({ question: '', answer: '', category: 'general', keywords: '', priority: 0 });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/projects/${projectId}/knowledge/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['knowledge', projectId] });
            queryClient.invalidateQueries({ queryKey: ['knowledge-stats', projectId] });
            setDeleteDialog({ open: false });
        },
    });

    // Test mutation
    const testMutation = useMutation({
        mutationFn: async (query: string) => {
            const response = await api.post(`/projects/${projectId}/knowledge/test`, { query });
            return response.data.data;
        },
        onSuccess: (data) => {
            setTestResults(data);
        },
    });

    const handleEdit = (entry?: KnowledgeEntry) => {
        if (entry) {
            setFormData({
                question: entry.question,
                answer: entry.answer,
                category: entry.category,
                keywords: entry.keywords.join(', '),
                priority: entry.priority,
            });
        } else {
            setFormData({ question: '', answer: '', category: 'general', keywords: '', priority: 0 });
        }
        setEditDialog({ open: true, entry });
    };

    const handleSave = () => {
        saveMutation.mutate({
            ...formData,
            id: editDialog.entry?._id,
        });
    };

    const handleTest = () => {
        if (testQuery.trim()) {
            testMutation.mutate(testQuery);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-7 h-7 text-indigo-500" />
                        Knowledge Base
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Train your chatbot with Q&A pairs
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setTestDialog(true)}>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Chatbot
                    </Button>
                    <Button
                        onClick={() => handleEdit()}
                        className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Q&A
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.total || 0}</p>
                                <p className="text-xs text-gray-500">Total Q&A</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Check className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.active || 0}</p>
                                <p className="text-xs text-gray-500">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Tag className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats?.categories?.length || 0}</p>
                                <p className="text-xs text-gray-500">Categories</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">100%</p>
                                <p className="text-xs text-gray-500">Free AI</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Free AI Notice */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                            <Check className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-200">100% Free AI Chatbot</h3>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Your chatbot uses smart keyword matching - no paid APIs needed! For enhanced responses,
                                install <a href="https://ollama.ai" target="_blank" className="underline font-medium">Ollama</a> locally (also free).
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {data?.categories?.map((cat: Category) => (
                            <SelectItem key={cat.name} value={cat.name}>
                                {cat.name} ({cat.count})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Knowledge List */}
            {isLoading ? (
                <KnowledgeBaseSkeleton />
            ) : data?.entries?.length === 0 ? (
                <Card className="py-16">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                            <Brain className="w-10 h-10 text-indigo-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Q&A pairs yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                            Add questions and answers to train your chatbot.
                        </p>
                        <Button onClick={() => handleEdit()} className="bg-gradient-to-r from-indigo-500 to-purple-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Add First Q&A
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {data.entries.map((entry: KnowledgeEntry) => (
                        <Card key={entry._id} className="hover:shadow-md transition-all group">
                            <CardContent className="p-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                {entry.question}
                                            </h3>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <Badge variant={entry.status === 'active' ? 'success' : 'secondary'}>
                                                    {entry.status}
                                                </Badge>
                                                <Badge variant="outline">{entry.category}</Badge>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                            {entry.answer}
                                        </p>

                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" />
                                                Used {entry.metrics.usageCount} times
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="w-3 h-3 text-green-500" />
                                                {entry.metrics.helpfulCount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsDown className="w-3 h-3 text-red-500" />
                                                {entry.metrics.notHelpfulCount}
                                            </span>
                                            {entry.keywords.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {entry.keywords.slice(0, 3).join(', ')}
                                                    {entry.keywords.length > 3 && '...'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(entry)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => setDeleteDialog({ open: true, entry })}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open })}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editDialog.entry ? 'Edit Q&A' : 'Add New Q&A'}
                        </DialogTitle>
                        <DialogDescription>
                            Add a question and answer to train your chatbot.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="question">Question</Label>
                            <Textarea
                                id="question"
                                placeholder="What question might users ask?"
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="answer">Answer</Label>
                            <Textarea
                                id="answer"
                                placeholder="How should the chatbot respond?"
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="general, shipping, returns..."
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority (0-10)</Label>
                                <Input
                                    id="priority"
                                    type="number"
                                    min={0}
                                    max={10}
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                            <Input
                                id="keywords"
                                placeholder="shipping, delivery, order, track..."
                                value={formData.keywords}
                                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                            />
                            <p className="text-xs text-gray-500">
                                Keywords help match user questions. Auto-generated if left empty.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!formData.question || !formData.answer || saveMutation.isPending}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                            {saveMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Q&A'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Q&A</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this question? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteDialog.entry && deleteMutation.mutate(deleteDialog.entry._id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Test Dialog */}
            <Dialog open={testDialog} onOpenChange={setTestDialog}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TestTube className="w-5 h-5 text-indigo-500" />
                            Test Your Chatbot
                        </DialogTitle>
                        <DialogDescription>
                            Enter a question to see how your chatbot will respond.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ask a question..."
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTest()}
                            />
                            <Button
                                onClick={handleTest}
                                disabled={!testQuery.trim() || testMutation.isPending}
                            >
                                {testMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Test'
                                )}
                            </Button>
                        </div>

                        {testResults && (
                            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Your Question:</p>
                                    <p className="text-gray-900 dark:text-white">{testResults.query}</p>
                                </div>

                                {testResults.bestMatch ? (
                                    <div>
                                        <p className="text-sm font-medium text-green-600 mb-1 flex items-center gap-1">
                                            <Check className="w-4 h-4" />
                                            Match Found (Score: {(testResults.bestMatch.score * 100).toFixed(0)}%)
                                        </p>
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                            <p className="font-medium text-sm mb-1">{testResults.bestMatch.question}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{testResults.bestMatch.answer}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1">
                                            <X className="w-4 h-4" />
                                            No Good Match Found
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            The chatbot will use the fallback message. Consider adding a Q&A for this topic.
                                        </p>
                                    </div>
                                )}

                                {testResults.matches && testResults.matches.length > 1 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-2">Other Potential Matches:</p>
                                        <div className="space-y-2">
                                            {testResults.matches.slice(1, 4).map((match: any, i: number) => (
                                                <div key={i} className="text-sm p-2 bg-white dark:bg-gray-900 rounded border">
                                                    <span className="text-gray-500">({(match.score * 100).toFixed(0)}%)</span>{' '}
                                                    {match.question}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTestDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
