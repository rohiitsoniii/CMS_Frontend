import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { contentAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Search } from 'lucide-react';

interface RelationshipFieldProps {
    projectId: string;
    label: string;
    value: string | string[];
    onChange: (value: string | string[]) => void;
    multiple?: boolean;
    contentType?: string;
    description?: string;
}

export function RelationshipField({
    projectId,
    label,
    value,
    onChange,
    multiple = false,
    contentType,
    description,
}: RelationshipFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch available content
    const { data: availableContent, isLoading } = useQuery({
        queryKey: ['content', projectId, contentType, search],
        queryFn: () =>
            contentAPI.getAll(projectId, {
                type: contentType,
                search: search || undefined,
                limit: 50,
            }),
        enabled: isOpen,
    });

    // Fetch selected content details
    const selectedIds = Array.isArray(value) ? value : value ? [value] : [];
    const { data: selectedContent } = useQuery({
        queryKey: ['content-details', selectedIds],
        queryFn: async () => {
            if (selectedIds.length === 0) return [];
            const promises = selectedIds.map(id =>
                contentAPI.getById(projectId, id)
            );
            const results = await Promise.all(promises);
            return results.map(r => r.data.data.content);
        },
        enabled: selectedIds.length > 0,
    });

    const handleSelect = (contentId: string) => {
        if (multiple) {
            const currentValue = Array.isArray(value) ? value : [];
            if (currentValue.includes(contentId)) {
                onChange(currentValue.filter(id => id !== contentId));
            } else {
                onChange([...currentValue, contentId]);
            }
        } else {
            onChange(contentId);
            setIsOpen(false);
        }
    };

    const handleRemove = (contentId: string) => {
        if (multiple) {
            const currentValue = Array.isArray(value) ? value : [];
            onChange(currentValue.filter(id => id !== contentId));
        } else {
            onChange('');
        }
    };

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {description && (
                <p className="text-sm text-gray-500">{description}</p>
            )}

            {/* Selected Items */}
            {selectedContent && selectedContent.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {selectedContent.map((item: any) => (
                        <Badge
                            key={item._id}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <span className="text-xs text-gray-500">{item.type}</span>
                            <span>{item.name}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(item._id)}
                                className="ml-1 hover:text-red-500"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Add Button */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        {multiple ? 'Add Items' : 'Select Item'}
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>
                            Select {contentType || 'Content'}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {isLoading ? (
                            <div className="text-center py-8 text-gray-500">
                                Loading...
                            </div>
                        ) : availableContent?.data.data.contents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No content found
                            </div>
                        ) : (
                            availableContent?.data.data.contents.map((item: any) => {
                                const isSelected = selectedIds.includes(item._id);
                                return (
                                    <button
                                        key={item._id}
                                        type="button"
                                        onClick={() => handleSelect(item._id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-colors ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium">{item.name}</div>
                                                <div className="text-sm text-gray-500">
                                                    {item.type} • {item.status}
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <Badge variant="default">Selected</Badge>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Actions */}
                    {multiple && (
                        <div className="border-t pt-4">
                            <Button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-full"
                            >
                                Done ({selectedIds.length} selected)
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
