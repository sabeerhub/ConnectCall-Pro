import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, 
  MessageSquare, Users, Settings, Share2, PanelRight, 
  ChevronRight, Info, ShieldCheck, Maximize2, MoreVertical,
  Hand, Sparkles, Smile, Lock, Send, Loader2, BarChart3,
  Cpu, Zap, Brain, Activity, Globe, Wifi, Clock,
  LayoutGrid, User, Monitor, Eye, History, Bookmark,
  Layers, Volume2, Search, Filter, Palette, Ghost, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useWebRTC, Participant } from '../../rtc/useWebRTC';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getMeeting, sendMessage, subscribeToMeetingMessages, endMeeting, subscribeToMeeting, removeParticipant } from '../../firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface VideoTileProps {
  participant: Participant;
  isSpeaker?: boolean;
  isHost?: boolean;
  onToggleMedia?: (type: 'audio' | 'video', value: boolean, targetUserId: string) => void;
  onKick?: (targetUserId: string) => void;
  key?: React.Key;
}

const VideoTile = ({ participant, isSpeaker, isHost, onToggleMedia, onKick }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (videoRef.current && participant.stream && !participant.isVideoOff) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream, participant.isVideoOff]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      className={cn(
        "relative rounded-[2.5rem] overflow-hidden glass-dark group transition-all duration-700",
        isSpeaker ? "ring-[3px] ring-primary ring-offset-8 ring-offset-[#0a0502] scale-[1.05] z-10 shadow-[0_0_80px_rgba(139,92,246,0.4)]" : "shadow-2xl border border-white/5",
        "aspect-video w-full h-full min-h-[180px] perspective-1000"
      )}
    >
      {participant.isVideoOff ? (
        <div className="w-full h-full bg-[#111] flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-primary/5 animate-pulse" />
           <Avatar className="w-20 h-20 md:w-32 md:h-32 border-[6px] border-[#0a0502] shadow-2xl relative z-10 transition-transform duration-500 group-hover:scale-110">
              <AvatarImage src={participant.photo} className="object-cover" />
              <AvatarFallback className="text-3xl md:text-5xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                 {participant.name[0]}
              </AvatarFallback>
           </Avatar>
           <div className="absolute bottom-10 flex gap-1 items-end h-8">
              {[0.2, 0.5, 0.8, 0.4, 0.6].map((h, i) => (
                <motion.div 
                  key={i}
                  animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-1 bg-primary/40 rounded-full"
                />
              ))}
           </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.isLocal}
          className={cn(
            "w-full h-full object-cover bg-black filter brightness-[1.1] contrast-[1.1]",
            participant.isLocal && "scale-x-[-1]"
          )}
        />
      )}
      
      {/* HUD Overlay - Apple-style subtle and glassmorphic */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none">
         <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
            <Badge className="bg-black/40 backdrop-blur-2xl border-white/10 text-[10px] font-bold tracking-[0.2em] uppercase py-1 px-3">
              {participant.isLocal ? "Local Node" : "Remote Peer"}
            </Badge>
            <div className="flex gap-2">
               <div className="w-8 h-8 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center pointer-events-auto">
                  <Wifi size={12} className="text-green-500" />
               </div>
            </div>
         </div>

         <div className="flex items-end justify-between transition-all duration-500">
            <div className="flex flex-col gap-1 pointer-events-auto">
               <div className="flex items-center gap-3 bg-black/60 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/5 shadow-2xl">
                 <div className={cn(
                   "w-2 h-2 rounded-full",
                   isSpeaker ? "bg-primary animate-ping" : "bg-green-500"
                 )} />
                 <span className="text-xs font-bold text-white tracking-widest uppercase">
                   {participant.isLocal ? "You" : participant.name}
                 </span>
                 {participant.isMuted && <MicOff size={12} className="text-red-500/80" />}
               </div>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 pointer-events-auto">
               {isHost && !participant.isLocal && (
                  <div className="relative">
                     <Button 
                       size="icon" 
                       variant="ghost" 
                       className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 hover:bg-white/10"
                       onClick={() => setShowControls(!showControls)}
                     >
                        <MoreVertical size={16} />
                     </Button>
                     
                     <AnimatePresence>
                       {showControls && (
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.9, y: 10 }}
                           animate={{ opacity: 1, scale: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.9, y: 10 }}
                           className="absolute bottom-full right-0 mb-3 w-56 bg-black/80 backdrop-blur-3xl rounded-[2rem] border border-white/10 p-3 z-[100] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]"
                         >
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] px-4 py-3 border-b border-white/5 mb-2">Authority Controls</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start rounded-2xl text-xs font-bold gap-4 py-6 hover:bg-white/5"
                              onClick={() => {
                                onToggleMedia?.('audio', participant.isMuted, participant.id);
                                setShowControls(false);
                              }}
                            >
                               {participant.isMuted ? <Mic size={16} className="text-green-500" /> : <MicOff size={16} className="text-red-500" />}
                               {participant.isMuted ? 'Remote Unmute' : 'Remote Mute'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start rounded-2xl text-xs font-bold gap-4 py-6 hover:bg-white/5"
                              onClick={() => {
                                onToggleMedia?.('video', participant.isVideoOff, participant.id);
                                setShowControls(false);
                              }}
                            >
                               {participant.isVideoOff ? <VideoIcon size={16} className="text-green-500" /> : <VideoOff size={16} className="text-red-500" />}
                               {participant.isVideoOff ? 'Enable View' : 'Suspend View'}
                            </Button>
                            <Separator className="my-2 bg-white/5" />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full justify-start rounded-2xl text-xs font-bold gap-4 py-6 hover:bg-red-500/10 text-red-500"
                              onClick={() => {
                                if (window.confirm('Remove participant from session?')) {
                                  onKick?.(participant.id);
                                  setShowControls(false);
                                }
                              }}
                            >
                               <X size={16} />
                               Remove Peer
                            </Button>
                         </motion.div>
                       )}
                     </AnimatePresence>
                  </div>
               )}
               <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center text-white">
                  {participant.isMuted ? <MicOff size={16} className="text-red-500" /> : <Activity size={16} className="text-primary animate-pulse" />}
               </div>
            </div>
         </div>
      </div>

      {/* Spatial Depth Border for active speaker */}
      {isSpeaker && (
        <div className="absolute inset-0 ring-[6px] ring-primary/40 ring-inset pointer-events-none z-20" />
      )}
    </motion.div>
  );
};

export default function MeetingRoom() {
  const { id } = useParams();
  const roomId = useMemo(() => {
    if (!id) return '';
    // Clean ID: take everything before first '?' or '/' if present
    return id.split(/[?#]/)[0].trim();
  }, [id]);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const [meetingData, setMeetingData] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'ai'>('chat');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus' | 'theater'>('grid');
  const [meetingTime, setMeetingTime] = useState(0);

  const { participants, toggleMedia, activeSpeakerId, kickUser } = useWebRTC(
    (isAuthorized && roomId) ? roomId : '', 
    user?.uid || 'GUEST', 
    user?.displayName || 'Guest User',
    user?.photoURL || undefined
  );

  const localParticipant = useMemo(() => participants.find(p => p.isLocal), [participants]);

  useEffect(() => {
    if (localParticipant) {
      setIsMuted(localParticipant.isMuted);
      setIsVideoOff(localParticipant.isVideoOff);
    }
  }, [localParticipant?.isMuted, localParticipant?.isVideoOff]);

  useEffect(() => {
    const timer = setInterval(() => setMeetingTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setMounted(true);
    const verifyMeeting = async () => {
      if (!roomId) return;
      const data = await getMeeting(roomId);
      if (!data) {
        toast.error('Meeting not found');
        navigate('/dashboard');
        return;
      }
      if (data.status === 'ended') {
        toast.error('This meeting has already ended');
        navigate('/dashboard');
        return;
      }
      setMeetingData(data);
      if (data.password && data.hostId !== user?.uid) {
        setShowPasswordDialog(true);
      } else {
        setIsAuthorized(true);
      }
    };
    verifyMeeting();
  }, [roomId, user?.uid]);

  useEffect(() => {
    if (!isAuthorized || !roomId) return;
    const unsub = subscribeToMeetingMessages(roomId, (msgs) => {
      setChatMessages(msgs);
    });
    
    const meetingUnsub = subscribeToMeeting(roomId, (data) => {
      if (data && data.status === 'ended') {
        toast.info('Meeting has been ended by the host');
        navigate('/dashboard');
      }
    });

    return () => {
      unsub();
      meetingUnsub();
    };
  }, [isAuthorized, roomId, navigate]);

  const handlePasswordSubmit = () => {
    if (passwordInput === meetingData?.password) {
      setIsAuthorized(true);
      setShowPasswordDialog(false);
      toast.success('Access granted');
    } else {
      toast.error('Incorrect password');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !user) return;
    
    try {
      await sendMessage(roomId, {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderPhoto: user.photoURL,
        meetingId: roomId
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Join my ConnectCall meeting',
        url: url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Meeting link copied to clipboard');
    }
  };

  const handleRaiseHand = () => {
    toast.info('You raised your hand');
    if (user && roomId) {
      sendMessage(roomId, {
        text: '🤚 raised hand',
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderPhoto: user.photoURL,
        meetingId: roomId
      });
    }
  };

  const handleLeave = async () => {
    if (!roomId) return;
    
    const isHost = meetingData?.hostId === user?.uid;
    
    if (isHost) {
      const confirmEnd = window.confirm('Are you sure you want to end the call for everyone?');
      if (confirmEnd) {
        try {
          await endMeeting(roomId);
          toast.success('Meeting ended for everyone');
        } catch (error) {
          toast.error('Failed to end meeting');
        }
      } else {
        // Just leave the room
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
      toast.info('You left the meeting');
    }
  };

  if (!mounted) return null;

  if (!isAuthorized && showPasswordDialog) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0502] p-6">
        <Card className="w-full max-w-md border-white/10 bg-card/40 backdrop-blur-3xl rounded-[2rem] overflow-hidden">
           <CardHeader className="text-center pt-10">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                 <Lock size={32} />
              </div>
              <CardTitle className="text-2xl font-bold text-white">Private Meeting</CardTitle>
              <CardDescription className="text-white/60">
                 This meeting is protected by a password. Please enter it to join.
              </CardDescription>
           </CardHeader>
           <CardContent className="px-10 pb-10 space-y-6">
              <div className="space-y-2">
                 <Label className="text-xs uppercase font-bold tracking-widest text-white/40">Access Password</Label>
                 <Input 
                   type="password" 
                   value={passwordInput}
                   onChange={(e) => setPasswordInput(e.target.value)}
                   placeholder="Enter password..."
                   className="h-12 bg-white/5 border-white/10 rounded-xl focus:bg-white/10 transition-all text-white"
                 />
              </div>
              <div className="flex gap-3">
                 <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex-1 rounded-xl text-white/60 hover:text-white">
                    Cancel
                 </Button>
                 <Button onClick={handlePasswordSubmit} className="flex-1 btn-premium rounded-xl h-12 font-bold">
                    Join Meeting
                 </Button>
              </div>
           </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
     return (
       <div className="h-screen w-full flex items-center justify-center bg-[#0a0502]">
          <Loader2 className="animate-spin text-primary" size={48} />
       </div>
     );
  }

  return (
    <div className="h-screen bg-[#0a0502] flex flex-col overflow-hidden text-white font-sans selection:bg-primary/30">
      {/* Premium Intelligent Top Navigation */}
      <header className="h-20 px-8 flex items-center justify-between relative z-[100] bg-black/40 backdrop-blur-3xl border-b border-white/5">
        <div className="flex items-center gap-2 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-primary flex items-center justify-center text-white shadow-[0_12px_24px_-8px_rgba(139,92,246,0.5)] group-hover:scale-110 transition-transform">
               <VideoIcon size={18} className="md:size-[22px] animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg md:text-xl leading-none">Connect<span className="text-primary">Call</span></span>
              <span className="text-[8px] md:text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-1 line-clamp-1">AI Communication</span>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-6 md:h-8 bg-white/5 hidden sm:block" />
          
          <div className="hidden sm:flex items-center gap-4">
             <Badge className="bg-white/5 border-white/10 text-white/60 font-bold px-4 py-1.5 rounded-2xl flex items-center gap-3">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[10px] tracking-[0.1em] uppercase">AES-256 Encrypted</span>
             </Badge>
             <div className="flex items-center gap-2 text-white/40">
                <Clock size={14} />
                <span className="text-xs font-mono font-medium">{formatTime(meetingTime)}</span>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* AI Status Indicator */}
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="hidden lg:flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-6 py-2 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
          >
             <Sparkles size={14} className="text-primary" />
             <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Neural Engine Active</span>
          </motion.div>

          {/* Network Status */}
          <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-2xl px-4 py-2 border border-white/5">
             <Wifi size={14} className="text-green-500" />
             <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em]">98ms • 60fps</span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
             <Button variant="ghost" size="icon" className="w-9 h-9 md:w-11 md:h-11 rounded-xl glass hover:bg-white/10 text-white/60">
                <Maximize2 size={16} className="md:size-[18px]" />
             </Button>
             <Button 
               variant="ghost" 
               size="icon" 
               className="w-9 h-9 md:w-11 md:h-11 rounded-xl glass hover:bg-white/10 text-white/60"
               onClick={() => {
                 setActiveTab('ai');
                 setSidebarOpen(true);
               }}
             >
                <Brain size={16} className="md:size-[18px]" />
             </Button>
          </div>
        </div>
      </header>

      {/* Main Cinematic Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
         {/* Immersive Environment Effects */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[150px]" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
         </div>

         {/* Advanced Smart Layout Engine */}
         <div className="flex-1 p-8 flex items-center justify-center relative z-10 transition-all duration-700 overflow-hidden">
            <div className={cn(
               "grid gap-8 w-full max-w-screen-2xl h-full items-center justify-center content-center transition-all duration-700",
               layoutMode === 'grid' && (
                 participants.length === 1 ? "grid-cols-1 max-w-5xl aspect-video" :
                 participants.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-6xl" :
                 participants.length <= 4 ? "grid-cols-1 md:grid-cols-2 max-w-7xl" :
                 "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
               ),
               layoutMode === 'focus' && "grid-cols-[1fr_300px] gap-6",
               layoutMode === 'theater' && "grid-cols-1"
            )}>
               <AnimatePresence mode="popLayout" initial={false}>
                  {participants.map((p) => (
                    <VideoTile 
                      key={p.id} 
                      participant={p} 
                      isSpeaker={p.id === activeSpeakerId}
                      isHost={meetingData?.hostId === user?.uid}
                      onToggleMedia={toggleMedia}
                      onKick={kickUser}
                    />
                  ))}
               </AnimatePresence>
            </div>

            {/* Layout Switcher - Floating floating */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-3xl p-1.5 rounded-2xl border border-white/10 shadow-2xl opacity-0 hover:opacity-100 transition-opacity duration-300">
               <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLayoutMode('grid')}
                  className={cn("h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2", layoutMode === 'grid' && "bg-primary/20 text-primary")}
               >
                  <LayoutGrid size={14} /> Grid
               </Button>
               <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLayoutMode('focus')}
                  className={cn("h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2", layoutMode === 'focus' && "bg-primary/20 text-primary")}
               >
                  <User size={14} /> Focus
               </Button>
               <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLayoutMode('theater')}
                  className={cn("h-8 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest gap-2", layoutMode === 'theater' && "bg-primary/20 text-primary")}
               >
                  <Monitor size={14} /> Theater
               </Button>
            </div>
         </div>

         {/* Contextual Intelligence & Collaboration Panel */}
         <AnimatePresence>
            {sidebarOpen && (
              <motion.div 
                initial={{ x: 400, opacity: 0, filter: 'blur(10px)' }}
                animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ x: 400, opacity: 0, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-black/40 backdrop-blur-3xl border-l border-white/5 flex flex-col h-full z-[250] shadow-[-20px_0_100px_rgba(0,0,0,0.5)]"
              >
                 <div className="h-20 px-8 flex items-center justify-between border-b border-white/5">
                    <div className="flex bg-white/5 rounded-2xl p-1.5">
                       {[
                         { id: 'chat', label: 'Chat', icon: MessageSquare },
                         { id: 'participants', label: 'Nexus', icon: Users },
                         { id: 'ai', label: 'Intelligence', icon: Sparkles }
                       ].map((tab) => (
                         <Button 
                           key={tab.id}
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setActiveTab(tab.id as any)}
                           className={cn(
                             "rounded-xl h-10 px-4 text-[10px] font-bold uppercase tracking-widest gap-2 transition-all", 
                             activeTab === tab.id && "bg-primary text-white shadow-xl shadow-primary/20"
                           )}
                         >
                            <tab.icon size={14} />
                            <span className="hidden lg:inline">{tab.label}</span>
                         </Button>
                       ))}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSidebarOpen(false)} 
                      className="w-10 h-10 rounded-2xl hover:bg-white/5"
                    >
                       <X size={20} className="text-white/40" />
                    </Button>
                 </div>

                 <ScrollArea className="flex-1 px-8">
                    {activeTab === 'chat' && (
                       <div className="space-y-8 py-8">
                          {/* AI Realtime Summary Card */}
                          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Activity size={40} className="text-primary" />
                             </div>
                             <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 flex items-center gap-2">
                                <Zap size={14} className="animate-bounce" /> Realtime Intelligence
                             </p>
                             <p className="text-sm text-white/90 leading-relaxed font-medium">
                                Discussion focusing on the technical architecture of the communication node. Key point: "Latency remains below 100ms".
                             </p>
                          </div>
                          
                          <div className="space-y-8">
                             {chatMessages.map((msg, i) => (
                               <motion.div 
                                 initial={{ opacity: 0, x: 20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 key={msg.id || i} 
                                 className="flex gap-4 group"
                               >
                                  <Avatar className="w-10 h-10 shrink-0 border-2 border-white/5 shadow-xl">
                                     <AvatarImage src={msg.senderPhoto} />
                                     <AvatarFallback className="bg-white/5 font-bold">{msg.senderName[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                     <div className="flex items-center gap-3 mb-1">
                                        <p className="text-xs font-bold text-primary tracking-wide">{msg.senderName}</p>
                                        <span className="text-[10px] font-bold text-white/10 uppercase tracking-tighter">
                                          {msg.timestamp?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'System'}
                                        </span>
                                     </div>
                                     <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/5 text-sm text-white/80 leading-relaxed group-hover:bg-white/[0.08] transition-colors">
                                       {msg.text}
                                     </div>
                                  </div>
                               </motion.div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === 'participants' && (
                       <div className="space-y-8 py-8">
                          <div className="flex items-center justify-between px-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Active Entities ({participants.length})</p>
                            <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10">
                               Invite Peer
                            </Button>
                          </div>
                          <div className="grid gap-4">
                             {participants.map(p => (
                               <motion.div 
                                 whileHover={{ scale: 1.02 }}
                                 key={p.id} 
                                 className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:border-full-5/20 transition-all group"
                               >
                                  <div className="flex items-center gap-4">
                                     <div className="relative">
                                       <Avatar className="w-12 h-12 border-2 border-primary/20">
                                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">{p.name[0]}</AvatarFallback>
                                       </Avatar>
                                       <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0502]" />
                                     </div>
                                     <div>
                                        <p className="text-sm font-bold text-white truncate max-w-[180px]">{p.name} {p.isLocal && <span className="text-primary text-[10px] ml-1 tracking-widest">Self</span>}</p>
                                        <p className="text-[9px] uppercase font-bold text-white/20 tracking-[0.2em] mt-0.5">Secure Endpoint</p>
                                     </div>
                                  </div>
                                  <div className="flex gap-2 items-center">
                                     {meetingData?.hostId === user?.uid && !p.isLocal && (
                                       <Button 
                                         variant="ghost" 
                                         size="icon" 
                                         onClick={() => {
                                           if (window.confirm(`Remove ${p.name}?`)) {
                                             kickUser(p.id);
                                           }
                                         }}
                                         className="w-8 h-8 md:w-9 md:h-9 rounded-xl hover:bg-red-500/10 hover:text-red-500"
                                       >
                                          <X size={14} />
                                       </Button>
                                     )}
                                     <Button 
                                       variant="ghost" 
                                       size="icon" 
                                       disabled={meetingData?.hostId !== user?.uid && !p.isLocal}
                                       onClick={() => toggleMedia('audio', p.isMuted, p.id)}
                                       className="w-8 h-8 md:w-9 md:h-9 rounded-xl hover:bg-white/10"
                                     >
                                        {p.isMuted ? <MicOff size={14} className="text-red-500" /> : <Mic size={14} className="text-green-500" />}
                                     </Button>
                                  </div>
                               </motion.div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === 'ai' && (
                       <div className="space-y-8 py-8">
                          <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
                             <Brain size={48} className="mx-auto mb-6 text-primary animate-pulse" />
                             <h3 className="text-xl font-bold mb-2">Neural Workspace</h3>
                             <p className="text-sm text-white/40 font-medium">Connect Call AI is processing visual and auditory signals for meeting synthesis.</p>
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Live Insights</h4>
                                {[
                                  { label: 'Action Items', count: 3, icon: Zap, color: 'text-yellow-500' },
                                  { label: 'Key Decisions', count: 2, icon: ShieldCheck, color: 'text-blue-500' },
                                  { label: 'Follow-ups', count: 5, icon: History, color: 'text-purple-500' }
                                ].map((item, i) => (
                                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors cursor-pointer">
                                     <div className="flex items-center gap-4">
                                        <div className={cn("w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center", item.color)}>
                                          <item.icon size={18} />
                                        </div>
                                        <span className="text-sm font-bold">{item.label}</span>
                                     </div>
                                     <Badge className="bg-primary/20 text-primary border-0 rounded-lg">{item.count}</Badge>
                                  </div>
                                ))}
                             </div>

                             <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-center text-white/20 mb-6">Realtime Transcription Engine</p>
                                <div className="space-y-4 font-mono text-[11px] text-white/60 leading-relaxed max-h-[200px] overflow-hidden relative">
                                   <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent z-10" />
                                   <p><span className="text-primary font-bold mr-2">[00:12:44]</span> Mustapha: "The frontend layer requires cinematic transitions."</p>
                                   <p><span className="text-primary font-bold mr-2">[00:12:56]</span> AI Node: Processing layout shift to theater mode.</p>
                                   <p><span className="text-primary font-bold mr-2">[00:13:02]</span> Sarah: "Agreed, the glassmorphism looks premium."</p>
                                   <p className="animate-pulse">_</p>
                                </div>
                             </div>
                          </div>
                       </div>
                    )}
                 </ScrollArea>
                 
                 {activeTab === 'chat' && (
                    <div className="p-4 md:p-8 border-t border-white/5 bg-black/60 backdrop-blur-3xl">
                       <form onSubmit={handleSendMessage} className="bg-white/5 rounded-2xl p-1.5 md:p-2 flex items-center gap-2 md:gap-3 border border-white/5 focus-within:border-primary/50 transition-all shadow-2xl">
                          <Input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Message standard node..." 
                            className="bg-transparent border-0 outline-none flex-1 text-xs md:text-sm font-bold h-10 md:h-12 px-3 md:px-4 focus-visible:ring-0 placeholder:text-white/10"
                          />
                          <Button type="submit" size="icon" disabled={!newMessage.trim()} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary hover:bg-primary/80 transition-all group active:scale-90 shadow-xl shadow-primary/30">
                             <Send size={18} className="md:size-[20px] group-hover:translate-x-1 transition-transform" />
                          </Button>
                       </form>
                    </div>
                 )}
              </motion.div>
            )}
         </AnimatePresence>
      </main>

      {/* Futuristic Floating Command Dock */}
      <footer className="h-24 md:h-32 px-4 md:px-12 flex items-center justify-center fixed bottom-4 md:bottom-6 inset-x-0 z-[200] pointer-events-none">
         <div className="flex items-center gap-2 md:gap-6 glass-dark p-2 md:p-3 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] pointer-events-auto backdrop-blur-[60px] relative px-4 md:px-8 max-w-[95vw] overflow-x-auto no-scrollbar">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 rounded-[2.2rem] md:rounded-[3.2rem] opacity-50 blur-xl pointer-events-none" />
            
            {/* Left Controls */}
            <div className="flex items-center gap-2 md:gap-4">
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger 
                       render={
                          <Button 
                             size="icon" 
                             variant={isMuted ? "destructive" : "secondary"}
                             onClick={() => {
                               const newState = !isMuted;
                               setIsMuted(newState);
                               if (user?.uid) {
                                 toggleMedia('audio', !newState, user.uid);
                               }
                             }}
                             className={cn(
                               "w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.75rem] shadow-2xl transition-all duration-300 active:scale-90",
                               !isMuted ? "bg-white/5 hover:bg-white/10 text-white" : "bg-red-500 text-white"
                             )}
                          >
                             {isMuted ? <MicOff size={20} className="md:size-[24px]" /> : <Mic size={20} className="md:size-[24px]" />}
                          </Button>
                       } 
                     />
                     <TooltipContent className="bg-black/80 backdrop-blur-xl border-white/10 font-bold uppercase tracking-widest text-[10px]">Mic: {isMuted ? 'Off' : 'On'}</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                     <TooltipTrigger 
                       render={
                          <Button 
                             size="icon" 
                             variant={isVideoOff ? "destructive" : "secondary"}
                             onClick={() => {
                               const newState = !isVideoOff;
                               setIsVideoOff(newState);
                               if (user?.uid) {
                                 toggleMedia('video', !newState, user.uid);
                               }
                             }}
                             className={cn(
                               "w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.75rem] shadow-2xl transition-all duration-300 active:scale-90",
                               !isVideoOff ? "bg-white/5 hover:bg-white/10 text-white" : "bg-red-500 text-white"
                             )}
                          >
                             {isVideoOff ? <VideoOff size={20} className="md:size-[24px]" /> : <VideoIcon size={20} className="md:size-[24px]" />}
                          </Button>
                       } 
                     />
                     <TooltipContent className="bg-black/80 backdrop-blur-xl border-white/10 font-bold uppercase tracking-widest text-[10px]">Cam: {isVideoOff ? 'Off' : 'On'}</TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-8 md:h-10 bg-white/10" />

            {/* Center Controls */}
            <div className="flex items-center gap-2 md:gap-4">
               <TooltipProvider>
                  {[
                    { id: 'share', icon: Share2, label: 'Share' },
                    { id: 'ai', icon: Sparkles, label: 'Neural', active: sidebarOpen && activeTab === 'ai' },
                    { id: 'chat', icon: MessageSquare, label: 'Chat', active: sidebarOpen && activeTab === 'chat' },
                    { id: 'presence', icon: Users, label: 'Nexus', active: sidebarOpen && activeTab === 'participants' }
                  ].map((ctrl) => (
                    <React.Fragment key={ctrl.id}>
                      <Tooltip>
                        <TooltipTrigger 
                          render={
                            <Button 
                              onClick={() => {
                                if (ctrl.id === 'share') {
                                  handleShare();
                                  return;
                                }
                                setActiveTab(ctrl.id as any);
                                setSidebarOpen(true);
                              }}
                              size="icon" 
                              className={cn(
                                "w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.75rem] glass hover:bg-white/10 shadow-2xl transition-all duration-300 active:scale-90",
                                ctrl.active && "bg-primary text-white shadow-primary/30 scale-105"
                              )}
                            >
                              <ctrl.icon size={20} className="md:size-[24px]" />
                            </Button>
                          } 
                        />
                        <TooltipContent className="bg-black/80 backdrop-blur-xl border-white/10 font-bold uppercase tracking-widest text-[10px]">{ctrl.label}</TooltipContent>
                      </Tooltip>
                    </React.Fragment>
                  ))}
               </TooltipProvider>
               
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger render={
                       <Button 
                         onClick={handleRaiseHand}
                         size="icon" 
                         className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.75rem] glass hover:bg-white/10 shadow-2xl transition-all active:scale-90"
                       >
                          <Hand size={20} className="md:size-[24px]" />
                       </Button>
                     } />
                     <TooltipContent className="bg-black/80 backdrop-blur-xl border-white/10 font-bold uppercase tracking-widest text-[10px]">Raise Hand</TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            </div>

            <Separator orientation="vertical" className="h-8 md:h-10 bg-white/10" />

            {/* Right End Call Control */}
            <div className="flex items-center gap-2 md:gap-4 px-1 md:px-2">
               <TooltipProvider>
                  <Tooltip>
                     <TooltipTrigger 
                       render={
                         <Button 
                            variant="destructive" 
                            onClick={handleLeave}
                            className="h-12 md:h-16 px-4 md:px-10 rounded-[1.2rem] md:rounded-[1.75rem] font-bold flex items-center gap-2 md:gap-4 shadow-[0_20px_40px_-10px_rgba(239,68,68,0.5)] active:scale-95 transition-all group bg-red-500 hover:bg-red-600 border-0"
                         >
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-white/10 flex items-center justify-center transition-transform group-hover:rotate-12">
                               <PhoneOff size={16} className="md:size-[20px]" fill="currentColor" />
                            </div>
                            <span className="tracking-[0.1em] text-[10px] md:text-sm uppercase whitespace-nowrap">
                              {meetingData?.hostId === user?.uid ? 'End Broadcast' : 'Leave Space'}
                            </span>
                         </Button>
                       } 
                     />
                     <TooltipContent className="bg-black/80 backdrop-blur-xl border-white/10 font-bold uppercase tracking-widest text-[10px]">End Session</TooltipContent>
                  </Tooltip>
               </TooltipProvider>
            </div>
         </div>
      </footer>
      </div>
   );
}
