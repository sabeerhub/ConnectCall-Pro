import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Video, 
  Link as LinkIcon, 
  Lock, 
  CircleDot, 
  ArrowRight, 
  Loader2, 
  Clipboard, 
  AlertCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getMeetingData } from '../../firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const navigate = useNavigate();
  const [meetingInput, setMeetingInput] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [validatedMeeting, setValidatedMeeting] = useState<any>(null);

  // Auto-detect invite links from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setMeetingInput(text);
        toast.info("Link pasted from clipboard", { duration: 2000 });
      }
    } catch (err) {
      // Clipboard access denied
    }
  };

  const extractMeetingId = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return "";

    // 1. Check if it's a full URL
    try {
      const url = new URL(trimmed);
      const pathParts = url.pathname.split('/');
      // The meeting ID should be the last part of the path in /meeting/:id
      const idPart = pathParts[pathParts.length - 1];
      if (idPart) return idPart;
    } catch (e) {
      // Not a valid URL, continue to other checks
    }

    // 2. Fallback to extracting the ID part directly if it's mixed with other text
    // Our IDs are 8-char capital alphanumeric strings: ABCDEFGH
    // Or it could be a UUID if we change formats later
    const idRegex = /[A-Z0-9]{8}|[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}/i;
    const match = trimmed.match(idRegex);
    
    return match ? match[0] : trimmed;
  };

  const validateMeeting = async () => {
    if (!meetingInput) return;
    
    setLoading(true);
    setError(null);
    const meetingId = extractMeetingId(meetingInput);

    try {
      const data = await getMeetingData(meetingId);
      
      if (!data) {
        setError("Meeting not found. Please check the ID or link.");
        setValidatedMeeting(null);
        return;
      }

      setValidatedMeeting(data);
      if ((data as any).password) {
        setShowPasswordInput(true);
      } else {
        // Direct join if no password
        navigate(`/meeting/${data.id}`);
        onClose();
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWithPassword = () => {
    if (!validatedMeeting) return;
    
    if ((validatedMeeting as any).password === password) {
      navigate(`/meeting/${validatedMeeting.id}`);
      onClose();
    } else {
      setError("Incorrect password. Please try again.");
      toast.error("Access denied: Incorrect password");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-card/40 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative z-10"
        >
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                <Video size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Join Session</h2>
                <p className="text-muted-foreground text-sm font-medium">Enter a room ID or invite link</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl hover:bg-white/5">
              <X size={24} />
            </Button>
          </div>

          <div className="p-8 pt-4 space-y-8">
            {/* Input Section */}
            <div className="space-y-4">
              {!showPasswordInput ? (
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <LinkIcon size={18} />
                    </div>
                    <Input 
                      placeholder="Paste meeting link or ID..."
                      value={meetingInput}
                      onChange={(e) => {
                        setMeetingInput(e.target.value);
                        setError(null);
                      }}
                      className="h-14 pl-12 pr-32 rounded-2xl bg-black/20 border-white/5 focus:bg-black/40 focus:ring-1 focus:ring-primary/40 transition-all font-medium"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={handlePaste}
                         className="h-10 rounded-xl text-xs font-bold text-muted-foreground hover:bg-white/5 uppercase tracking-wider"
                       >
                          <Clipboard size={14} className="mr-2" /> Paste
                       </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold"
                      >
                         <AlertCircle size={18} className="shrink-0" />
                         {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button 
                    onClick={validateMeeting}
                    disabled={loading || !meetingInput}
                    className="w-full h-14 rounded-2xl btn-premium text-lg font-bold shadow-2xl shadow-primary/20 group"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" />
                    ) : (
                      <>
                        Verify Identity <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Hash size={18} />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Selected Meeting</p>
                        <h4 className="font-bold">{validatedMeeting.title}</h4>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Private Credentials Required</Label>
                    <div className="relative">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                       <Input 
                         type="password"
                         placeholder="Enter room password..."
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         className="h-14 pl-12 rounded-2xl bg-black/20 border-white/5 focus:bg-black/40 font-medium"
                         autoFocus
                       />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowPasswordInput(false)}
                      className="h-14 flex-1 rounded-2xl font-bold border border-white/5"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleJoinWithPassword}
                      disabled={!password}
                      className="h-14 flex-[2] rounded-2xl btn-premium text-lg font-bold"
                    >
                      Authorize Access
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Methods */}
            {!showPasswordInput && (
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-center">
                  <CircleDot className="mx-auto mb-2 text-primary/60" size={18} />
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">End-to-End</p>
                  <p className="text-xs font-bold">Encrypted</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors text-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mx-auto mb-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <p className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Network</p>
                  <p className="text-xs font-bold">Resilient</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-black/20 p-6 text-center">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Enterprise Secure Access Node • Global v4.2</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
