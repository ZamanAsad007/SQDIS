import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { api } from '@/services/api';

export function EmailVerificationPage() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid verification token');
      return;
    }

    api
      .get(`/email-aliases/verify/${token}`)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err?.response?.data?.message || 'Verification link expired or invalid');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-slate-800 shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">Email Verification</CardTitle>
          <CardDescription>Confirming your email alias registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Verifying your email token...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Email Verified!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your email alias has been successfully verified and linked.
                </p>
              </div>
              <Link to="/settings/emails" className="w-full pt-2">
                <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                  Go to Email Settings <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="h-14 w-14 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <XCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Verification Failed</h3>
                <p className="text-sm text-rose-500 dark:text-rose-400">{errorMessage}</p>
              </div>
              <Link to="/login" className="w-full pt-2">
                <Button variant="outline" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailVerificationPage;
