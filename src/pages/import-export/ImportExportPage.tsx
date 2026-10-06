import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Database,
  History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const ImportExportPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const { toast } = useToast();

  const handleExport = async (format: 'json' | 'csv' | 'zip') => {
    try {
      setExportLoading(true);
      // Constructing blob download
      const response = await api.get(`/projects/${projectId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `project_export_${projectId}.${format === 'zip' ? 'zip' : format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast({ title: "Export Successful", description: "Your project data has been downloaded." });
    } catch (error) {
      toast({ title: "Export Failed", variant: "destructive" });
    } finally {
      setExportLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    try {
      setImportLoading(true);
      setImportProgress(10);
      
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await api.post(`/projects/${projectId}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setImportProgress(percentCompleted);
        }
      });
      
      if (response.data.success) {
        toast({ 
          title: "Import Successful", 
          description: "Project data has been merged successfully." 
        });
        setImportFile(null);
        setImportProgress(0);
      }
    } catch (error) {
      toast({ 
        title: "Import Failed", 
        description: "Check file format and try again.", 
        variant: "destructive" 
      });
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import & Export</h1>
        <p className="text-muted-foreground mt-2">Transfer your project data between environments or keep external backups.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Export Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
              <Download className="w-6 h-6" />
            </div>
            <CardTitle>Export Project Data</CardTitle>
            <CardDescription>Download your content, knowledge base, and settings as a portable file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer transition-colors" onClick={() => handleExport('json')}>
                <FileJson className="w-5 h-5 text-amber-500" />
                <div className="flex-grow">
                  <div className="text-sm font-semibold">JSON Structure</div>
                  <div className="text-xs text-muted-foreground">Standard machine-readable format</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer transition-colors" onClick={() => handleExport('csv')}>
                <FileSpreadsheet className="w-5 h-5 text-green-500" />
                <div className="flex-grow">
                  <div className="text-sm font-semibold">CSV Tables</div>
                  <div className="text-xs text-muted-foreground">Best for Excel or data analysis</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:border-indigo-200 hover:bg-indigo-50/10 cursor-pointer transition-colors" onClick={() => handleExport('zip')}>
                <FileJson className="w-5 h-5 text-indigo-500" />
                <div className="flex-grow">
                  <div className="text-sm font-semibold">Full Archive (ZIP)</div>
                  <div className="text-xs text-muted-foreground">Includes all media and version history</div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
          <div className="p-6 pt-0 mt-auto border-t bg-gray-50/50 rounded-b-xl">
             <div className="flex items-start gap-3 mt-4">
                <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Exports are scoped to the current project. Admin credentials are required to import this data into another tenant.
                </p>
             </div>
          </div>
        </Card>

        {/* Import Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <CardTitle>Import Project Data</CardTitle>
            <CardDescription>Upload a JSON or ZIP export to populate this project with external data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 flex-grow">
            <div 
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${importFile ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) setImportFile(e.dataTransfer.files[0]);
              }}
            >
              <input 
                type="file" 
                id="import-file" 
                className="hidden" 
                accept=".json,.zip"
                onChange={(e) => e.target.files && setImportFile(e.target.files[0])}
              />
              <label htmlFor="import-file" className="cursor-pointer block">
                {importFile ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-indigo-500 mx-auto" />
                    <div className="font-semibold text-indigo-900">{importFile.name}</div>
                    <div className="text-xs text-indigo-600">{(importFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    <Button variant="outline" size="sm" className="mt-2" onClick={(e) => {e.preventDefault(); setImportFile(null)}}>Clear</Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-sm font-medium text-slate-600">Drag and drop file or click to browse</p>
                    <p className="text-xs text-slate-400">Accepts .json and .zip formats</p>
                  </div>
                )}
              </label>
            </div>

            {importLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                   <span>Processing import...</span>
                   <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-1.5" />
              </div>
            )}

            <Button 
              className="w-full h-12 text-md font-semibold bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              disabled={!importFile || importLoading}
              onClick={handleImport}
            >
              {importLoading ? <History className="w-5 h-5 mr-2 animate-spin" /> : <Database className="w-5 h-5 mr-2" />}
              Start Import
            </Button>
          </CardContent>
          <div className="p-6 pt-0 mt-auto border-t bg-gray-50/50 rounded-b-xl">
             <div className="flex items-start gap-3 mt-4">
                <AlertCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-bold text-orange-600">Warning:</span> Importing will attempt to merge data. Duplicate IDs will be updated with values from the import file.
                </p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ImportExportPage;
