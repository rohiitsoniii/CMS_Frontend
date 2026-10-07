import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { UserCheck, AlertTriangle, ArrowRight, Loader2, Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { api } from '@/services/api';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/team/accept-invite', { token });
      setSuccess(true);
      setTeamInfo(response.data?.data);
      toast.success('Invitation accepted successfully! Welcome to the team.');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid or expired invitation token.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If token exists and user is already logged in, we can prompt or automatically allow accept
    if (!token) {
      setError('No invitation token found in the URL. Please verify your invitation link.');
    }
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/20">
      <Card className="w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md">
        <CardHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
            {success ? (
              <UserCheck className="w-7 h-7 text-emerald-500" />
            ) : error ? (
              <AlertTriangle className="w-7 h-7 text-rose-500" />
            ) : (
              <Sparkles className="w-7 h-7 text-indigo-500" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {success
              ? 'Welcome to the Team!'
              : error
              ? 'Invitation Issue'
              : 'Join the Project'}
          </CardTitle>
          <CardDescription>
            {success
              ? 'Your membership has been activated.'
              : error
              ? 'We could not process your invitation token.'
              : 'You have been invited to collaborate on this Headless CMS workspace.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
              <p className="font-semibold text-sm">Access Granted</p>
              <p>
                You are now an active collaborator. You can manage content, schemas, and media assets based on your assigned role permissions.
              </p>
            </div>
          )}

          {!success && !error && (
            <div className="text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click below to accept this invitation and begin collaborating with your team.
              </p>
              {isAuthenticated && user && (
                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                  Signed in as: <span className="font-semibold">{user.email}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2.5 pt-2">
          {!success && !error && (
            <Button
              onClick={handleAccept}
              disabled={loading || !token}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Accepting Invitation...
                </>
              ) : (
                <>
                  Accept Invitation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}

          {success && (
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10 shadow-lg shadow-indigo-500/20"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {error && (
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default AcceptInvitePage;
