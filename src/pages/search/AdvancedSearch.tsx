import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Filter, X, Loader2, FileText, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdvancedSearchSkeleton } from '@/components/skeletons';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { sanitizeHtml } from '@/lib/sanitize';

interface SearchResult {
    id: string;
    score: number;
    content: {
        name: string;
        type: string;
        status: string;
        locale: string;
        createdAt: string;
        meta?: {
            tags?: string[];
            category?: string;
        };
    };
    highlights?: {
        name?: string[];
        'seo.metaTitle'?: string[];
        'seo.metaDescription'?: string[];
    };
}

export function AdvancedSearch() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        locale: '',
        tags: [] as string[],
    });
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Search query
    const { data, isLoading, error } = useQuery({
        queryKey: ['search', projectId, debouncedQuery, filters, page],
        queryFn: async () => {
            if (!debouncedQuery) return null;

            const params = new URLSearchParams({
                q: debouncedQuery,
                page: page.toString(),
                limit: '20',
                fuzzy: 'true',
                highlight: 'true',
            });

            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.locale) params.append('locale', filters.locale);
            filters.tags.forEach(tag => params.append('tags', tag));

            const response = await fetch(
                `/api/v1/projects/${projectId}/content/search?${params}`
            );
            const result = await response.json();
            return result.data;
        },
        enabled: debouncedQuery.length > 0,
    });

    // Autocomplete
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/api/v1/projects/${projectId}/content/search/autocomplete?q=${encodeURIComponent(query)}&limit=5`
                );
                const result = await response.json();
                setSuggestions(result.data.suggestions);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Autocomplete error:', error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, projectId]);

    const handleClearFilters = () => {
        setFilters({
            type: '',
            status: '',
            locale: '',
            tags: [],
        });
    };

    const handleResultClick = (result: SearchResult) => {
        navigate(`/dashboard/projects/${projectId}/content/${result.id}`);
    };

    const highlightText = (text: string[] | undefined) => {
        if (!text || text.length === 0) return null;
        return <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(text[0]) }} />;
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Search className="w-8 h-8" />
                    Advanced Search
                </h1>
                <p className="text-gray-600 mt-1">
                    Search across all your content with powerful filters
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search content..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="pl-10 pr-10 text-lg h-14"
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('');
                                setDebouncedQuery('');
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    {/* Autocomplete Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <Card className="absolute top-full mt-2 w-full z-10 p-2">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setQuery(suggestion);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    <Search className="w-4 h-4 inline mr-2 text-gray-400" />
                                    {suggestion}
                                </button>
                            ))}
                        </Card>
                    )}
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center gap-2 mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                    </Button>

                    {(filters.type || filters.status || filters.locale || filters.tags.length > 0) && (
                        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card className="p-4 mt-3">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Label>Content Type</Label>
                                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All types</SelectItem>
                                        <SelectItem value="blog">Blog</SelectItem>
                                        <SelectItem value="page">Page</SelectItem>
                                        <SelectItem value="product">Product</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Status</Label>
                                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Language</Label>
                                <Select value={filters.locale} onValueChange={(value) => setFilters({ ...filters, locale: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All languages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All languages</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Spanish</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Results */}
            {isLoading && (
                <AdvancedSearchSkeleton />
            )}

            {error && (
                <div className="text-center py-12 text-red-500">
                    Error searching content
                </div>
            )}

            {data && (
                <div>
                    {/* Stats */}
                    <div className="mb-4 flex items-center justify-between">
                        <p className="text-gray-600">
                            Found <strong>{data.total}</strong> results in <strong>{data.took}ms</strong>
                        </p>

                        {/* Facets */}
                        {data.facets && (
                            <div className="flex items-center gap-2">
                                {data.facets.types.slice(0, 3).map((facet: any) => (
                                    <Badge key={facet.value} variant="outline">
                                        {facet.value}: {facet.count}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Results List */}
                    <div className="space-y-3">
                        {data.hits.map((result: SearchResult) => (
                            <Card
                                key={result.id}
                                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleResultClick(result)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-5 h-5 text-gray-400" />
                                            <h3 className="font-semibold text-lg">
                                                {highlightText(result.highlights?.name) || result.content.name}
                                            </h3>
                                            <Badge variant="outline">{result.content.type}</Badge>
                                            <Badge
                                                className={
                                                    result.content.status === 'published'
                                                        ? 'bg-green-500'
                                                        : result.content.status === 'draft'
                                                            ? 'bg-yellow-500'
                                                            : 'bg-gray-500'
                                                }
                                            >
                                                {result.content.status}
                                            </Badge>
                                        </div>

                                        {result.highlights?.['seo.metaDescription'] && (
                                            <p className="text-gray-600 text-sm mb-2">
                                                {highlightText(result.highlights['seo.metaDescription'])}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(result.content.createdAt), 'MMM d, yyyy')}
                                            </span>

                                            {result.content.meta?.tags && result.content.meta.tags.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Tag className="w-4 h-4" />
                                                    {result.content.meta.tags.slice(0, 3).join(', ')}
                                                </span>
                                            )}

                                            <span className="ml-auto text-xs">
                                                Score: {result.score.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {data.total > 20 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="px-4">
                                Page {page} of {Math.ceil(data.total / 20)}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setPage(page + 1)}
                                disabled={page >= Math.ceil(data.total / 20)}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && !data && debouncedQuery && (
                <div className="text-center py-12 text-gray-500">
                    No results found for "{debouncedQuery}"
                </div>
            )}

            {!debouncedQuery && (
                <div className="text-center py-12 text-gray-500">
                    Start typing to search...
                </div>
            )}
        </div>
    );
}
