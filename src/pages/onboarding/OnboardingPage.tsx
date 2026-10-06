import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Get started with your CMS' },
  { id: 2, title: 'Create Project', description: 'Set up your first project' },
  { id: 3, title: 'Invite Team', description: 'Collaborate with your team' },
  { id: 4, title: 'Complete', description: 'You\'re all set!' }
];

export function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState({ name: '', description: '' });
  const [teamEmails, setTeamEmails] = useState('');
  const navigate = useNavigate();

  const progress = (step / STEPS.length) * 100;

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/projects', projectData);
      toast.success('Project created successfully');
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeam = async () => {
    if (!teamEmails.trim()) {
      setStep(4);
      return;
    }

    setLoading(true);
    try {
      const emails = teamEmails.split(',').map(e => e.trim()).filter(Boolean);
      await Promise.all(emails.map(email => 
        api.post('/team/invite', { email, role: 'editor' })
      ));
      toast.success('Team invitations sent');
      setStep(4);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await api.post('/auth/complete-onboarding');
      navigate('/dashboard');
    } catch (error) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Step {step} of {STEPS.length}</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Welcome to Your Headless CMS!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Let's get you set up in just a few steps. This will only take a minute.
              </p>
              <div className="grid gap-4 text-left max-w-md mx-auto mt-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Create your first project</p>
                    <p className="text-sm text-muted-foreground">Organize your content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Invite your team</p>
                    <p className="text-sm text-muted-foreground">Collaborate together</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Start creating content</p>
                    <p className="text-sm text-muted-foreground">Build amazing experiences</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="mt-8">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Create Your First Project</h2>
                <p className="text-muted-foreground">Projects help you organize content for different websites or apps</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Awesome Website"
                    value={projectData.name}
                    onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="A brief description of your project..."
                    value={projectData.description}
                    onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={handleCreateProject} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Project'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Invite Your Team</h2>
                <p className="text-muted-foreground">Collaborate with team members (optional)</p>
              </div>
              <div>
                <Label htmlFor="emails">Email Addresses</Label>
                <Textarea
                  id="emails"
                  placeholder="john@example.com, jane@example.com"
                  value={teamEmails}
                  onChange={(e) => setTeamEmails(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple emails with commas
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Skip
                </Button>
                <Button onClick={handleInviteTeam} disabled={loading} className="flex-1">
                  {loading ? 'Sending...' : 'Send Invites'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your CMS is ready to use. Start creating content types and managing your content.
              </p>
              <div className="grid gap-3 text-left max-w-md mx-auto mt-8">
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-1">📝 Create Content Types</p>
                  <p className="text-sm text-muted-foreground">Define your content structure</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-1">🎨 Add Content</p>
                  <p className="text-sm text-muted-foreground">Start creating your content</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-1">🚀 Use the API</p>
                  <p className="text-sm text-muted-foreground">Integrate with your apps</p>
                </div>
              </div>
              <Button onClick={handleComplete} className="mt-8">
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
