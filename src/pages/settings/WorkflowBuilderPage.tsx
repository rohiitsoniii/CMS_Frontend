import { WorkflowGraph } from '@/components/workflows/WorkflowGraph';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export default function WorkflowBuilderPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow Builder</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Design approval pipelines visually</p>
                </div>
                <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save Workflow
                </Button>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                 <div className="lg:col-span-3">
                    <WorkflowGraph />
                 </div>
                 <div className="space-y-4">
                     <div className="p-4 border rounded-lg bg-white dark:bg-gray-900 shadow-sm">
                         <h3 className="font-semibold text-sm mb-4">Node Properties</h3>
                         <p className="text-xs text-gray-500">Select a node on the graph to configure its parameters, roles, and automated webhooks.</p>
                     </div>
                 </div>
            </div>
        </div>
    )
}
