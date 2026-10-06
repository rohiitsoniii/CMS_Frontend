import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Eye, EyeOff, Download } from 'lucide-react';
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
  { value: 'api', label: 'API Keys', color: 'bg-blue-100 text-blue-800' },
  { value: 'database', label: 'Database', color: 'bg-green-100 text-green-800' },
  { value: 'auth', label: 'Authentication', color: 'bg-purple-100 text-purple-800' },
  { value: 'integration', label: 'Integrations', color: 'bg-orange-100 text-orange-800' },
  { value: 'custom', label: 'Custom', color: 'bg-gray-100 text-gray-800' }
];

export function EnvironmentPage() {
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editVariable, setEditVariable] = useState<EnvVariable | null>(null);
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
      setVariables(data);
    } catch (error) {
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variable?')) return;
    try {
      await api.delete(`/env-variables/${id}`);
      toast.success('Variable deleted');
      loadVariables();
    } catch (error) {
      toast.error('Failed to delete variable');
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
    } catch (error) {
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

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Environment Variables</h1>
          <p className="text-muted-foreground">Manage API keys, secrets, and configuration</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export .env
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Variable
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search variables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
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

      <div className="space-y-2">
        {filteredVariables.map((variable) => (
          <Card key={variable._id} className="hover:shadow-md transition-shadow">
            <CardContent className="py-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <code className="font-mono font-medium">{variable.key}</code>
                  <Badge className={categories.find(c => c.value === variable.category)?.color}>
                    {categories.find(c => c.value === variable.category)?.label || variable.category}
                  </Badge>
                  <Badge variant="outline">{variable.environment}</Badge>
                </div>
                {variable.description && (
                  <p className="text-sm text-muted-foreground mt-1">{variable.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <code className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {variable.isSecret 
                    ? (showSecrets.has(variable._id) ? variable.value : '••••••••••••')
                    : variable.value
                  }
                </code>
                {variable.isSecret && (
                  <Button variant="ghost" size="icon" onClick={() => toggleSecretVisibility(variable._id)}>
                    {showSecrets.has(variable._id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => openEdit(variable)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(variable._id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVariables.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No environment variables found.</p>
          <Button className="mt-4" onClick={openCreate}>Add your first variable</Button>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editVariable ? 'Edit Variable' : 'Add Variable'}</DialogTitle>
            <DialogDescription>
              {editVariable ? 'Update the environment variable.' : 'Create a new environment variable.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Key</Label>
              <Input
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') })}
                placeholder="MY_VARIABLE"
                disabled={!!editVariable}
              />
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="Value"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label>Environment</Label>
                <Select value={formData.environment} onValueChange={(v) => setFormData({ ...formData, environment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this variable for?"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSecret"
                checked={formData.isSecret}
                onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isSecret" className="font-normal">This is a secret value</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editVariable ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}