import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Pencil, Trash2, Eye, EyeOff, Download, KeyRound, Search } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface EnvVariable {
  _id: string;
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
  category: string;
  environment: string;
}

const categories = [
  { value: 'api', label: 'API Keys', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300' },
  { value: 'database', label: 'Database', color: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' },
  { value: 'auth', label: 'Authentication', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300' },
  { value: 'integration', label: 'Integrations', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300' },
  { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' }
];

export function EnvironmentPage() {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVariable, setEditVariable] = useState<EnvVariable | null>(null);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [deleteVariableId, setDeleteVariableId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    isSecret: false,
    description: '',
    category: 'custom',
    environment: 'all'
  });

  useEffect(() => {
    loadVariables();
  }, []);

  const loadVariables = async () => {
    try {
      const { data } = await api.get('/env-variables');
      setVariables(data.data || data || []);
    } catch {
      toast.error('Failed to load environment variables');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editVariable) {
        await api.put(`/env-variables/${editVariable._id}`, formData);
        toast.success('Variable updated successfully');
      } else {
        await api.post('/env-variables', formData);
        toast.success('Variable created successfully');
      }
      setDialogOpen(false);
      loadVariables();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save variable');
    }
  };

  const handleDelete = async () => {
    if (!deleteVariableId) return;
    try {
      await api.delete(`/env-variables/${deleteVariableId}`);
      toast.success('Variable deleted');
      loadVariables();
    } catch {
      toast.error('Failed to delete variable');
    } finally {
      setDeleteVariableId(null);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get('/env-variables/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '.env');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to export variables');
    }
  };

  const toggleSecretVisibility = (id: string) => {
    setShowSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const openEdit = (variable: EnvVariable) => {
    setEditVariable(variable);
    setFormData({
      key: variable.key,
      value: variable.value,
      isSecret: variable.isSecret,
      description: variable.description || '',
      category: variable.category,
      environment: variable.environment
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditVariable(null);
    setFormData({ key: '', value: '', isSecret: false, description: '', category: 'custom', environment: 'all' });
    setDialogOpen(true);
  };

  const filteredVariables = variables.filter(v => {
    const matchesSearch = v.key.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
        Loading environment variables...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <KeyRound className="w-6 h-6 text-primary" />
            Environment Variables
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage API keys, runtime secrets, and deployment configuration.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export .env
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Variable
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search variables by key or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-background">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2.5">
        {filteredVariables.map((variable) => (
          <Card key={variable._id} className="border border-border bg-card hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <code className="font-mono text-sm font-semibold text-foreground">{variable.key}</code>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categories.find(c => c.value === variable.category)?.color}`}>
                    {categories.find(c => c.value === variable.category)?.label || variable.category}
                  </span>
                  <Badge variant="outline" className="text-xs uppercase">{variable.environment}</Badge>
                </div>
                {variable.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-normal">{variable.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <code className="text-xs font-mono bg-muted/60 px-2.5 py-1 rounded-md text-foreground max-w-[200px] truncate">
                  {variable.isSecret 
                    ? (showSecrets.has(variable._id) ? variable.value : '••••••••••••')
                    : variable.value
                  }
                </code>
                {variable.isSecret && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => toggleSecretVisibility(variable._id)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title={showSecrets.has(variable._id) ? "Hide secret" : "Reveal secret"}
                    aria-label={showSecrets.has(variable._id) ? "Hide secret" : "Reveal secret"}
                  >
                    {showSecrets.has(variable._id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => openEdit(variable)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  title="Edit Variable"
                  aria-label="Edit Variable"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setDeleteVariableId(variable._id)}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  title="Delete Variable"
                  aria-label="Delete Variable"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVariables.length === 0 && (
        <div className="text-center py-16 bg-muted/20 border border-dashed border-border rounded-xl">
          <KeyRound className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h3 className="font-semibold text-foreground text-base">No environment variables found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Add key-value secrets or export environment variables for your application.
          </p>
          <Button className="mt-4 gap-2" onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Add First Variable
          </Button>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editVariable ? 'Edit Variable' : 'Add Variable'}</DialogTitle>
            <DialogDescription className="text-xs">
              {editVariable ? 'Update the environment variable key and secret value.' : 'Create a new key-value environment variable.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Key</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })}
                placeholder="MY_VARIABLE"
                disabled={!!editVariable}
                className="font-mono text-xs uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Value</Label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Value"
                className="font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Environment</Label>
                <Select value={formData.environment} onValueChange={(v) => setFormData({ ...formData, environment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this variable used for?"
                rows={2}
                className="text-xs resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                id="isSecret"
                checked={formData.isSecret}
                onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-xs text-foreground font-medium">Mask as secret value</span>
            </label>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editVariable ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteVariableId}
        onOpenChange={(open) => !open && setDeleteVariableId(null)}
        title="Delete Environment Variable"
        description="Are you sure you want to delete this environment variable? Applications relying on it will no longer receive its value."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default EnvironmentPage;