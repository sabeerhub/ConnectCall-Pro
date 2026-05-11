import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Github, AtSign, ArrowRight, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithGoogle, sendMagicLink } from '../../firebase/auth';
import { toast } from 'sonner';

interface AuthModalProps {
  onSuccess: () => void;
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await sendMagicLink(email);
      setMagicLinkSent(true);
      toast.success('Magic link has been sent to your email');
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-12 -translate-y-12" />
      
      <div className="flex flex-col items-center text-center mb-10 relative z-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-[1.25rem] bg-primary flex items-center justify-center text-white mb-6 shadow-[0_16px_32px_-8px_rgba(139,92,246,0.6)]"
        >
          <Video size={32} />
        </motion.div>
        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">Enterprise Communication</h2>
        <p className="text-muted-foreground font-medium">Step into your high-performance workspace.</p>
      </div>

      <div className="space-y-6 relative z-10">
        <Button 
          variant="outline" 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full h-14 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-sm font-bold"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          <span>Authorize via Google Cloud</span>
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            <span className="bg-card px-4">Secure Access Node</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!magicLinkSent ? (
             <motion.form 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleMagicLink} 
              className="space-y-6"
            >
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 ml-1">
                   <Mail size={12} /> Email Identity
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="identity@enterprise.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-black/20 border-white/5 focus:bg-black/40 focus:ring-1 focus:ring-primary/40 transition-all font-medium"
                  required
                />
              </div>
              <Button type="submit" disabled={loading || !email} className="w-full h-14 rounded-2xl btn-premium text-lg font-bold shadow-2xl shadow-primary/20">
                {loading ? <Loader2 className="animate-spin" /> : "Request Magic Key"} <ArrowRight className="ml-2" size={20} />
              </Button>
            </motion.form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4"
            >
               <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
                  <AtSign size={24} />
               </div>
               <h3 className="font-bold text-lg">Check your email</h3>
               <p className="text-sm text-muted-foreground">We sent a secure sign-in link to <span className="text-foreground font-semibold">{email}</span></p>
               <Button variant="ghost" onClick={() => setMagicLinkSent(false)} className="text-primary hover:text-primary hover:bg-primary/10">
                  Try another email
               </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground leading-relaxed px-4">
        By continuing, you agree to ConnectCall's <span className="text-foreground font-semibold cursor-pointer underline">Terms of Service</span> and <span className="text-foreground font-semibold cursor-pointer underline">Privacy Policy</span>.
      </p>
    </div>
  );
}
