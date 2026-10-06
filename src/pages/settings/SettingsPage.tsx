import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    User,
    Building,
    Shield,
    CreditCard,
    Save,
    Loader2,
    Check,
    Rocket,
    Trash2,
    Plus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store';
import { authAPI, projectAPI } from '@/services/api';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deploymentAPI } from '@/services/api';
import { SettingsSkeleton } from '@/components/skeletons';


export default function SettingsPage() {
    const { user, tenant, updateUser } = useAuthStore();
    const { projectId } = useParams();
    const queryClient = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Fetch project if in project context
    const { data: project, isLoading: isProjectLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            if (!projectId) return null;
            const response = await projectAPI.getById(projectId);
            return response.data.data.project;
        },
        enabled: !!projectId,
    });

    // Deployments state
    const [deploying, setDeploying] = useState<string | null>(null);

    const { data: integrations, refetch: refetchIntegrations } = useQuery({
        queryKey: ['deployments', projectId],
        queryFn: async () => {
            if (!projectId) return [];
            const response = await deploymentAPI.getIntegrations(projectId);
            return response.data;
        },
        enabled: !!projectId,
    });

    const createIntegrationMutation = useMutation({
        mutationFn: (data: any) => deploymentAPI.createIntegration(projectId!, data),
        onSuccess: () => {
            refetchIntegrations();
            toast.success('Integration added');
        },
        onError: () => toast.error('Failed to add integration')
    });

    const triggerDeployMutation = useMutation({
        mutationFn: (id: string) => deploymentAPI.triggerDeploy(id),
        onSuccess: () => {
            refetchIntegrations();
            toast.success('Deployment triggered!');
        },
        onSettled: () => setDeploying(null)
    });

    const deleteIntegrationMutation = useMutation({
        mutationFn: (id: string) => deploymentAPI.deleteIntegration(id),
        onSuccess: () => {
            refetchIntegrations();
            toast.success('Integration removed');
        }
    });

    const updateProjectMutation = useMutation({
        mutationFn: (data: any) => projectAPI.update(projectId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project', projectId] });
            toast.success('Project settings updated');
        },
        onError: () => toast.error('Failed to update project settings')
    });


    const { register, handleSubmit } = useForm({
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            email: user?.email || '',
        },
    });

    // Update form when project loads
    if (project && !saving) {
        // We can't easily sync react-hook-form with async data without useEffect, 
        // but for now we'll handle project form separately to avoid conflicts with user profile form
    }

    const onProfileSubmit = async (data: { firstName: string; lastName: string }) => {
        try {
            setSaving(true);
            await authAPI.updateProfile(data);
            updateUser({ firstName: data.firstName, lastName: data.lastName });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            toast.success('Profile updated');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const onProjectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            settings: {
                ...project?.settings,
                previewUrl: formData.get('previewUrl') as string,
            }
        };
        updateProjectMutation.mutate(data);
    };

    const planFeatures: Record<string, string[]> = {
        free: ['10 blog posts', '5 hero sections', '1,000 API calls/month', '100MB storage'],
        basic: ['100 blog posts', '20 hero sections', '50,000 API calls/month', '5GB storage'],
        pro: ['Unlimited content', 'Unlimited API calls', '50GB storage', 'Webhooks', 'Custom domains'],
        enterprise: ['Everything in Pro', 'Dedicated support', 'SLA guarantees', 'Custom integrations'],
    };

    if (projectId && isProjectLoading) return <SettingsSkeleton />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projectId ? 'Project Settings' : 'Settings'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {projectId ? `Manage settings for ${project?.name || 'project'}` : 'Manage your account and preferences'}
                </p>
            </div>

            <Tabs defaultValue={projectId ? "project" : "profile"} className="space-y-6">
                <TabsList className={`grid w-full ${projectId ? 'grid-cols-5' : 'grid-cols-4'} lg:w-auto lg:inline-grid`}>
                    {projectId && (
                        <TabsTrigger value="project" className="flex items-center gap-2">
                            <SettingsIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Project</span>
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        <span className="hidden sm:inline">Organization</span>
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden sm:inline">Billing</span>
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="hidden sm:inline">Security</span>
                    </TabsTrigger>
                    {projectId && (
                        <TabsTrigger value="deployments" className="flex items-center gap-2">
                            <Rocket className="w-4 h-4" />
                            <span className="hidden sm:inline">Deployments</span>
                        </TabsTrigger>
                    )}
                </TabsList>


                {/* Project Tab */}
                {projectId && project && (
                    <TabsContent value="project">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Configuration</CardTitle>
                                <CardDescription>Update your project settings and preview URL</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={onProjectSubmit} className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label htmlFor="projectName">Project Name</Label>
                                        <Input id="projectName" name="name" defaultValue={project.name} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="projectDesc">Description</Label>
                                        <Textarea id="projectDesc" name="description" defaultValue={project.description} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="previewUrl">Live Preview URL</Label>
                                        <Input
                                            id="previewUrl"
                                            name="previewUrl"
                                            defaultValue={project.settings?.previewUrl || ''}
                                            placeholder="https://your-site.com/api/preview"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Endpoint that handles the preview token. Example: <code>/api/preview</code> or <code>/preview</code>
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={updateProjectMutation.isPending}>
                                        {updateProjectMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Save Project Settings
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* Deployments Tab */}
                {projectId && (
                    <TabsContent value="deployments">
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Continuous Deployment</CardTitle>
                                            <CardDescription>Connect your project to Vercel, Netlify, or custom webhooks</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid gap-4">
                                            {integrations?.map((integration: any) => (
                                                <div key={integration._id} className="flex items-center justify-between p-4 border rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border">
                                                            <Rocket className="w-5 h-5 text-indigo-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{integration.name}</p>
                                                            <p className="text-sm text-gray-500 capitalize">{integration.provider} • {integration.lastDeployStatus || 'No deploys yet'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {integration.lastDeployAt && (
                                                            <span className="text-xs text-gray-400 mr-2">
                                                                Last deploy: {new Date(integration.lastDeployAt).toLocaleString()}
                                                            </span>
                                                        )}
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => {
                                                                setDeploying(integration._id);
                                                                triggerDeployMutation.mutate(integration._id);
                                                            }}
                                                            disabled={deploying === integration._id}
                                                        >
                                                            {deploying === integration._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deploy Now'}
                                                        </Button>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="text-red-500 hover:text-red-600"
                                                            onClick={() => deleteIntegrationMutation.mutate(integration._id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {(!integrations || integrations.length === 0) && (
                                                <div className="text-center py-8 border-2 border-dashed rounded-xl">
                                                    <p className="text-gray-500">No deployment integrations found.</p>
                                                </div>
                                            )}
                                        </div>

                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const target = e.target as any;
                                            createIntegrationMutation.mutate({
                                                name: target.name.value,
                                                provider: target.provider.value,
                                                hookUrl: target.hookUrl.value,
                                            });
                                            target.reset();
                                        }} className="space-y-4 pt-4 border-t">
                                            <h4 className="font-medium">Add New Integration</h4>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="intName">Integration Name</Label>
                                                    <Input id="intName" name="name" placeholder="Production / Staging" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="provider">Provider</Label>
                                                    <select id="provider" name="provider" className="w-full px-3 py-2 bg-background border rounded-md">
                                                        <option value="vercel">Vercel</option>
                                                        <option value="netlify">Netlify</option>
                                                        <option value="custom">Custom Webhook</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hookUrl">Build Hook URL</Label>
                                                <Input id="hookUrl" name="hookUrl" placeholder="https://api.vercel.com/v1/integrations/deploy/..." required />
                                            </div>
                                            <Button type="submit">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Integration
                                            </Button>
                                        </form>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20">
                                <CardHeader>
                                    <CardTitle className="text-indigo-900 dark:text-indigo-400">Pro Tip: Automated Deploys</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                        You can also configure triggers to automatically deploy to these targets whenever content is published. 
                                        Enable "Auto-deploy on Publish" in your organization settings.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                )}


                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" {...register('firstName')} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" {...register('lastName')} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" {...register('email')} disabled />
                                    <p className="text-xs text-gray-500">Contact support to change your email</p>
                                </div>
                                <Button type="submit" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : saved ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Organization Tab */}
                <TabsContent value="organization">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization Details</CardTitle>
                                <CardDescription>Information about your CMS workspace</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label>Organization Name</Label>
                                    <Input defaultValue={tenant?.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Workspace Slug</Label>
                                    <Input defaultValue={tenant?.slug} disabled />
                                    <p className="text-xs text-gray-500">Used in your API URLs</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Company</Label>
                                    <Input defaultValue={tenant?.name || ''} placeholder="Your company name" />
                                </div>
                                <Button>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>CORS Settings</CardTitle>
                                <CardDescription>Configure allowed origins for API requests</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label>Allowed Origins</Label>
                                    <Textarea
                                        placeholder="https://mysite.com&#10;https://app.mysite.com"
                                        className="min-h-[100px]"
                                    />
                                    <p className="text-xs text-gray-500">One URL per line. Leave empty to allow all origins.</p>
                                </div>
                                <Button>
                                    <Save className="w-4 h-4" />
                                    Save Origins
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>Your subscription details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-white">
                                            {tenant?.subscription?.plan?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize flex items-center gap-2">
                                            {tenant?.subscription?.plan} Plan
                                            <Badge variant="success">Active</Badge>
                                        </h3>
                                        <p className="text-gray-500">
                                            {tenant?.subscription?.plan === 'free' ? 'Free forever' : 'Billed monthly'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-2 mb-6">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan includes:</p>
                                    <ul className="grid gap-1">
                                        {planFeatures[tenant?.subscription?.plan || 'free']?.map((feature) => (
                                            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Check className="w-4 h-4 text-emerald-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {tenant?.subscription?.plan !== 'enterprise' && (
                                    <Button variant="gradient">
                                        Upgrade Plan
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Usage This Month</CardTitle>
                                <CardDescription>Your current usage statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">API Calls</span>
                                            <span className="font-medium">{tenant?.usage?.apiCalls?.toLocaleString() || 0} / 1,000</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(((tenant?.usage?.apiCalls || 0) / 1000) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">Storage</span>
                                            <span className="font-medium">
                                                {((tenant?.usage?.storageUsed || 0) / (1024 * 1024)).toFixed(1)} MB / 100 MB
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(((tenant?.usage?.storageUsed || 0) / (100 * 1024 * 1024)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>Update your account password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input id="currentPassword" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input id="newPassword" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input id="confirmPassword" type="password" />
                                </div>
                                <Button>
                                    <Shield className="w-4 h-4" />
                                    Update Password
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>Add an extra layer of security to your account</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Enable 2FA</p>
                                        <p className="text-sm text-gray-500">Secure your account with TOTP authentication</p>
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link to="/dashboard/settings/mfa">Configure 2FA</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Single Sign-On (SSO)</CardTitle>
                                <CardDescription>Configure enterprise authentication providers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Google Workspace / SAML</p>
                                        <p className="text-sm text-gray-500">Enable team access via standard OAuth/SAML bridges</p>
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link to={projectId ? `/dashboard/project/${projectId}/settings/sso` : "/dashboard/settings/sso"}>Configure SSO</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Network Security & Audit</CardTitle>
                                <CardDescription>Manage IP restrictions and advanced security policies</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">IP Allowlist</p>
                                        <p className="text-sm text-gray-500">Restrict access to specific networks and audit logs</p>
                                    </div>
                                    <Button variant="outline" asChild>
                                        <Link to={projectId ? `/dashboard/project/${projectId}/settings/security` : "/dashboard/settings/security"}>Manage Allowlist</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sessions</CardTitle>
                                <CardDescription>Manage your active sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                                            <p className="text-sm text-gray-500">Windows • Chrome • Active now</p>
                                        </div>
                                        <Badge variant="success">Current</Badge>
                                    </div>
                                </div>
                                <Button variant="outline" className="mt-4">
                                    Sign out all other sessions
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
