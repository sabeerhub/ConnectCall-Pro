import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyMagicLink } from '../../firebase/auth';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleVerify = async () => {
      try {
        await verifyMagicLink();
        toast.success('Identity verified successfully');
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'Verification failed');
        setVerifying(false);
      }
    };

    handleVerify();
  }, [navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {verifying ? (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-2xl font-bold tracking-tight">Verifying Identity</h2>
            <p className="text-muted-foreground font-medium">Please wait while we establish your secure session.</p>
          </>
        ) : error ? (
          <>
            <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-red-500">Verification Failed</h2>
            <p className="text-muted-foreground font-medium">{error}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="text-primary hover:underline font-bold"
            >
              Return to Login
            </button>
          </>
        ) : (
           <>
            <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-green-500">Success</h2>
            <p className="text-muted-foreground font-medium">Redirecting to your dashboard...</p>
          </>
        )}
      </div>
    </div>
  );
}
