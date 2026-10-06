import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import {
    Upload,
    Grid,
    List,
    Search,
    Folder,
    FolderPlus,
    Image as ImageIcon,
    Film,
    FileText,
    Music,
    Trash2,
    Copy,
    Check,
    X,
    Loader2,
    MoreHorizontal,
    FolderOpen,
    Eye,
    Move,
    CheckSquare,
    Square,
    FolderEdit,
    Home,
    Crop,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mediaAPI } from '@/services/api';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { ImageEditor } from '@/components/media/ImageEditor';

interface MediaFile {
    _id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    storageKey: string;
    folder: string;
    alt: string;
    caption: string;
    tags: string[];
    dimensions?: { width: number; height: number };
    createdAt: string;
    uploadedBy?: { firstName: string; lastName: string };
}

interface Folder {
    name: string;
    count: number;
}

export default function MediaLibraryPage() {
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; file?: MediaFile }>({ open: false });
    const [folderDialog, setFolderDialog] = useState<{ open: boolean; mode: 'create' | 'rename'; folderName?: string }>({ open: false, mode: 'create' });
    const [moveDialog, setMoveDialog] = useState(false);
    const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newFolderName, setNewFolderName] = useState('');
    const [targetMoveFolder, setTargetMoveFolder] = useState('');
    const [imageEditorOpen, setImageEditorOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<MediaFile | null>(null);

    // Fetch media files
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['media', selectedFolder, selectedType, search],
        queryFn: async () => {
            const params: Record<string, string> = {};
            if (selectedFolder !== 'all') params.folder = selectedFolder;
            if (selectedType !== 'all') params.type = selectedType;
            if (search) params.search = search;

            const response = await mediaAPI.getAll(params);
            return response.data.data;
        },
    });

    // Fetch folders
    const { data: foldersData } = useQuery({
        queryKey: ['media-folders'],
        queryFn: async () => {
            const response = await mediaAPI.getFolders();
            return response.data.data.folders as Folder[];
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => mediaAPI.delete(id),
        onSuccess: () => {
            setDeleteDialog({ open: false });
            setSelectedFile(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success('File deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete file');
        },
    });

    // Bulk delete mutation
    const bulkDeleteMutation = useMutation({
        mutationFn: (fileIds: string[]) => mediaAPI.bulkDelete(fileIds),
        onSuccess: (_, fileIds) => {
            setBulkDeleteDialog(false);
            setSelectedFiles(new Set());
            refetch();
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success(`${fileIds.length} file(s) deleted successfully`);
        },
        onError: () => {
            toast.error('Failed to delete files');
        },
    });

    // Bulk move mutation
    const bulkMoveMutation = useMutation({
        mutationFn: ({ fileIds, folder }: { fileIds: string[]; folder: string }) =>
            mediaAPI.bulkMove(fileIds, folder),
        onSuccess: (_, { fileIds, folder }) => {
            setMoveDialog(false);
            setSelectedFiles(new Set());
            refetch();
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success(`${fileIds.length} file(s) moved to ${folder}`);
        },
        onError: () => {
            toast.error('Failed to move files');
        },
    });

    // Create folder mutation
    const createFolderMutation = useMutation({
        mutationFn: (name: string) => mediaAPI.createFolder(name),
        onSuccess: () => {
            setFolderDialog({ open: false, mode: 'create' });
            setNewFolderName('');
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success('Folder created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create folder');
        },
    });

    // Rename folder mutation
    const renameFolderMutation = useMutation({
        mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
            mediaAPI.renameFolder(oldName, newName),
        onSuccess: () => {
            setFolderDialog({ open: false, mode: 'create' });
            setNewFolderName('');
            refetch();
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success('Folder renamed successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to rename folder');
        },
    });

    // Delete folder mutation
    const deleteFolderMutation = useMutation({
        mutationFn: (name: string) => mediaAPI.deleteFolder(name),
        onSuccess: () => {
            if (selectedFolder !== 'all') {
                setSelectedFolder('all');
            }
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success('Folder deleted successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete folder');
        },
    });

    // Handle file upload
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setUploading(true);
        setUploadProgress(0);

        try {
            for (let i = 0; i < acceptedFiles.length; i++) {
                const file = acceptedFiles[i];
                await mediaAPI.upload(file, { folder: selectedFolder !== 'all' ? selectedFolder : 'uploads' });
                setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
            }
            refetch();
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });
            toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [selectedFolder, refetch, queryClient]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
            'video/*': ['.mp4', '.webm'],
            'audio/*': ['.mp3', '.wav'],
            'application/pdf': ['.pdf'],
        },
        maxSize: 50 * 1024 * 1024, // 50MB
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return ImageIcon;
        if (mimeType.startsWith('video/')) return Film;
        if (mimeType.startsWith('audio/')) return Music;
        return FileText;
    };

    const isImage = (mimeType: string) => mimeType.startsWith('image/');

    const getMediaUrl = (file: MediaFile) => {
        return `${import.meta.env.VITE_API_URL || '/api/v1'}/media/${file.storageKey}`;
    };

    const copyUrl = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
        toast.success('URL copied to clipboard');
    };

    const toggleFileSelection = (fileId: string) => {
        const newSelection = new Set(selectedFiles);
        if (newSelection.has(fileId)) {
            newSelection.delete(fileId);
        } else {
            newSelection.add(fileId);
        }
        setSelectedFiles(newSelection);
    };

    const selectAllFiles = () => {
        if (data?.files?.length) {
            setSelectedFiles(new Set(data.files.map((f: MediaFile) => f._id)));
        }
    };

    const clearSelection = () => {
        setSelectedFiles(new Set());
    };

    const handleBulkDelete = () => {
        if (selectedFiles.size > 0) {
            bulkDeleteMutation.mutate(Array.from(selectedFiles));
        }
    };

    const handleBulkMove = () => {
        if (selectedFiles.size > 0 && targetMoveFolder) {
            bulkMoveMutation.mutate({ fileIds: Array.from(selectedFiles), folder: targetMoveFolder });
        }
    };

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            createFolderMutation.mutate(newFolderName);
        }
    };

    const handleRenameFolder = () => {
        if (newFolderName.trim() && folderDialog.folderName) {
            renameFolderMutation.mutate({ oldName: folderDialog.folderName, newName: newFolderName });
        }
    };

    const handleDeleteFolder = (folderName: string) => {
        if (confirm(`Are you sure you want to delete the folder "${folderName}"? This will only work if the folder is empty.`)) {
            deleteFolderMutation.mutate(folderName);
        }
    };

    const handleEditImage = (file: MediaFile) => {
        setEditingFile(file);
        setImageEditorOpen(true);
    };

    const handleSaveCroppedImage = async (croppedImageBlob: Blob, fileName: string) => {
        try {
            // Convert blob to File
            const file = new File([croppedImageBlob], fileName, { type: 'image/jpeg' });

            // Upload the cropped image
            await mediaAPI.upload(file, {
                folder: editingFile?.folder || 'uploads',
                alt: editingFile?.alt || '',
                caption: `Cropped version of ${editingFile?.originalName || ''}`,
            });

            // Refresh the media library
            refetch();
            queryClient.invalidateQueries({ queryKey: ['media-folders'] });

            toast.success('Cropped image saved successfully');
        } catch (error) {
            console.error('Failed to save cropped image:', error);
            toast.error('Failed to save cropped image');
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
                    <p className="text-gray-500 dark:text-gray-400">Upload and manage your media files</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedFiles.size > 0 && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                                {selectedFiles.size} file(s) selected
                            </span>
                            <Button variant="ghost" size="sm" onClick={clearSelection}>
                                <X className="w-4 h-4 mr-2" />
                                Clear
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setMoveDialog(true)}
                            >
                                <Move className="w-4 h-4 mr-2" />
                                Move to Folder
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBulkDeleteDialog(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Folders */}
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">Folders</h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setFolderDialog({ open: true, mode: 'create' })}
                                >
                                    <FolderPlus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedFolder('all')}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                        selectedFolder === 'all'
                                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 font-medium'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                    )}
                                >
                                    <Home className="w-4 h-4" />
                                    <span className="flex-1 text-left">All Files</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {data?.pagination?.total || 0}
                                    </Badge>
                                </button>
                                {foldersData?.map((folder) => (
                                    <div
                                        key={folder.name}
                                        className={cn(
                                            'group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                                            selectedFolder === folder.name
                                                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                        )}
                                    >
                                        <button
                                            onClick={() => setSelectedFolder(folder.name)}
                                            className="flex items-center gap-2 flex-1 text-left"
                                        >
                                            <Folder className="w-4 h-4" />
                                            <span className="flex-1 truncate">{folder.name}</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {folder.count}
                                            </Badge>
                                        </button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal className="w-3 h-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setFolderDialog({ open: true, mode: 'rename', folderName: folder.name });
                                                        setNewFolderName(folder.name);
                                                    }}
                                                >
                                                    <FolderEdit className="w-4 h-4 mr-2" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteFolder(folder.name)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Upload Zone */}
                    <div
                        {...getRootProps()}
                        className={cn(
                            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                            isDragActive
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800/50',
                            uploading && 'pointer-events-none opacity-60'
                        )}
                    >
                        <input {...getInputProps()} />
                        {uploading ? (
                            <div className="space-y-3">
                                <Loader2 className="w-10 h-10 mx-auto text-indigo-500 animate-spin" />
                                <p className="text-gray-600 dark:text-gray-400">Uploading... {uploadProgress}%</p>
                                <div className="w-48 h-2 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-indigo-500" />
                                </div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                                    {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    or click to browse • Max 50MB per file
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Supports: Images, Videos, Audio, PDF
                                </p>
                            </>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search files..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="image">Images</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                                <SelectItem value="document">Documents</SelectItem>
                            </SelectContent>
                        </Select>
                        {data?.files?.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectedFiles.size === data.files.length ? clearSelection : selectAllFiles}
                            >
                                {selectedFiles.size === data.files.length ? (
                                    <>
                                        <Square className="w-4 h-4 mr-2" />
                                        Deselect All
                                    </>
                                ) : (
                                    <>
                                        <CheckSquare className="w-4 h-4 mr-2" />
                                        Select All
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Media Grid/List */}
                    {isLoading ? (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-gray-200/70 dark:border-gray-800 overflow-hidden bg-white/50 dark:bg-gray-900/50 shadow-sm">
                                    <Skeleton width="100%" height={120} className="rounded-none" />
                                    <div className="p-3 space-y-1.5">
                                        <Skeleton width="80%" height={14} />
                                        <Skeleton width="45%" height={10} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : data?.files?.length === 0 ? (
                        <Card className="py-16">
                            <CardContent className="flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                                    <FolderOpen className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No files found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                                    Upload your first file by dragging it here or clicking the upload area.
                                </p>
                            </CardContent>
                        </Card>
                    ) : viewMode === 'grid' ? (
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {data?.files?.map((file: MediaFile) => {
                                const FileIcon = getFileIcon(file.mimeType);
                                const isSelected = selectedFiles.has(file._id);
                                return (
                                    <div
                                        key={file._id}
                                        className={cn(
                                            'group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer',
                                            isSelected
                                                ? 'ring-2 ring-indigo-500 border-indigo-500'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-500'
                                        )}
                                        onClick={() => setSelectedFile(file)}
                                    >
                                        {/* Selection Checkbox */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFileSelection(file._id);
                                            }}
                                            className="absolute top-2 left-2 z-10 w-6 h-6 rounded-md bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                                        </button>

                                        {isImage(file.mimeType) ? (
                                            <img
                                                src={getMediaUrl(file)}
                                                alt={file.alt || file.originalName}
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
                                                <FileIcon className="w-12 h-12 text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-500 px-2 truncate max-w-full">
                                                    {file.originalName}
                                                </span>
                                            </div>
                                        )}

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {isImage(file.mimeType) && (
                                                <Button
                                                    variant="secondary"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditImage(file);
                                                    }}
                                                    title="Edit Image"
                                                >
                                                    <Crop className="w-4 h-4 text-blue-500" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteDialog({ open: true, file });
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>

                                        {/* File info */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                            <p className="text-xs text-white truncate">{file.originalName}</p>
                                            <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data?.files?.map((file: MediaFile) => {
                                        const FileIcon = getFileIcon(file.mimeType);
                                        const isSelected = selectedFiles.has(file._id);
                                        return (
                                            <div
                                                key={file._id}
                                                className={cn(
                                                    'flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors',
                                                    isSelected && 'bg-indigo-50 dark:bg-indigo-900/20'
                                                )}
                                                onClick={() => setSelectedFile(file)}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFileSelection(file._id);
                                                    }}
                                                    className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0"
                                                >
                                                    {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                                                </button>
                                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                                    {isImage(file.mimeType) ? (
                                                        <img
                                                            src={getMediaUrl(file)}
                                                            alt={file.alt || file.originalName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                                            <FileIcon className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {file.originalName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(file.size)} • {file.folder}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline">{file.mimeType.split('/')[0]}</Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteDialog({ open: true, file });
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* File Details Dialog */}
            <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>File Details</DialogTitle>
                    </DialogHeader>

                    {selectedFile && (
                        <div className="space-y-4">
                            {/* Preview */}
                            <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                {isImage(selectedFile.mimeType) ? (
                                    <img
                                        src={getMediaUrl(selectedFile)}
                                        alt={selectedFile.alt || selectedFile.originalName}
                                        className="w-full max-h-64 object-contain"
                                    />
                                ) : (
                                    <div className="h-32 flex items-center justify-center">
                                        {(() => {
                                            const FileIcon = getFileIcon(selectedFile.mimeType);
                                            return <FileIcon className="w-16 h-16 text-gray-400" />;
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="grid gap-3">
                                <div>
                                    <Label className="text-xs text-gray-500">Filename</Label>
                                    <p className="font-medium">{selectedFile.originalName}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-xs text-gray-500">Size</Label>
                                        <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">Type</Label>
                                        <p className="font-medium">{selectedFile.mimeType}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">Folder</Label>
                                    <p className="font-medium">{selectedFile.folder}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500">URL</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input
                                            value={getMediaUrl(selectedFile)}
                                            readOnly
                                            className="text-sm font-mono"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => copyUrl(getMediaUrl(selectedFile))}
                                        >
                                            {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedFile(null)}>
                            Close
                        </Button>
                        {selectedFile && isImage(selectedFile.mimeType) && (
                            <Button
                                variant="default"
                                onClick={() => {
                                    handleEditImage(selectedFile);
                                    setSelectedFile(null);
                                }}
                            >
                                <Crop className="w-4 h-4 mr-2" />
                                Edit Image
                            </Button>
                        )}
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setDeleteDialog({ open: true, file: selectedFile! });
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete File</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.file?.originalName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false })}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteDialog.file && deleteMutation.mutate(deleteDialog.file._id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Dialog */}
            <Dialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Multiple Files</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedFiles.size} file(s)? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                            disabled={bulkDeleteMutation.isPending}
                        >
                            {bulkDeleteMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                `Delete ${selectedFiles.size} File(s)`
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Move Dialog */}
            <Dialog open={moveDialog} onOpenChange={setMoveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Move Files</DialogTitle>
                        <DialogDescription>
                            Select a folder to move {selectedFiles.size} file(s) to.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Target Folder</Label>
                        <Select value={targetMoveFolder} onValueChange={setTargetMoveFolder}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select folder" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="uploads">uploads</SelectItem>
                                {foldersData?.map((folder) => (
                                    <SelectItem key={folder.name} value={folder.name}>
                                        {folder.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMoveDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkMove}
                            disabled={!targetMoveFolder || bulkMoveMutation.isPending}
                        >
                            {bulkMoveMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Moving...
                                </>
                            ) : (
                                `Move ${selectedFiles.size} File(s)`
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Folder Dialog (Create/Rename) */}
            <Dialog open={folderDialog.open} onOpenChange={(open) => setFolderDialog({ ...folderDialog, open })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {folderDialog.mode === 'create' ? 'Create New Folder' : 'Rename Folder'}
                        </DialogTitle>
                        <DialogDescription>
                            {folderDialog.mode === 'create'
                                ? 'Enter a name for the new folder.'
                                : `Rename "${folderDialog.folderName}" to a new name.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Folder Name</Label>
                        <Input
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            placeholder="e.g., blog-images"
                            className="mt-2"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setFolderDialog({ open: false, mode: 'create' });
                                setNewFolderName('');
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={folderDialog.mode === 'create' ? handleCreateFolder : handleRenameFolder}
                            disabled={
                                !newFolderName.trim() ||
                                createFolderMutation.isPending ||
                                renameFolderMutation.isPending
                            }
                        >
                            {(createFolderMutation.isPending || renameFolderMutation.isPending) ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {folderDialog.mode === 'create' ? 'Creating...' : 'Renaming...'}
                                </>
                            ) : (
                                folderDialog.mode === 'create' ? 'Create Folder' : 'Rename Folder'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Editor */}
            {editingFile && (
                <ImageEditor
                    open={imageEditorOpen}
                    onClose={() => {
                        setImageEditorOpen(false);
                        setEditingFile(null);
                    }}
                    imageUrl={getMediaUrl(editingFile)}
                    imageName={editingFile.originalName}
                    onSave={handleSaveCroppedImage}
                />
            )}
        </div>
    );
}
