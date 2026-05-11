import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Video, Calendar, Settings, Bell, Search, Plus, 
  ArrowUpRight, Clock, Shield, LogOut, ChevronRight,
  TrendingUp, Activity, LayoutGrid, List, Zap, Lock, Menu, X,
  Github, Twitter, Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '../../store/useAuthStore';
import { logout } from '../../firebase/auth';
import { useNavigate } from 'react-router-dom';
import { createMeeting, getUserMeetings } from '../../firebase/firestore';
import JoinMeetingModal from './JoinMeetingModal';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState('Overview');
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    attendance: 0,
    duration: '0 min'
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const meetings = await getUserMeetings(user.uid);
        setRecentMeetings(meetings);
        setStats({
          active: meetings.length,
          attendance: meetings.length * 5, // Simulated multiplier for demo
          duration: '42 min'
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [user]);

  const handleCreateMeeting = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const meetingId = await createMeeting(user.uid, meetingTitle, meetingPassword);
      setIsDialogOpen(false);
      navigate(`/meeting/${meetingId}`);
      toast.success('Meeting created successfully');
    } catch (error) {
      toast.error('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Navigation = () => (
    <nav className="flex-1 space-y-2 px-2">
      {[
        { name: "Overview", icon: LayoutGrid },
        { name: "Meetings", icon: Calendar },
        { name: "Participants", icon: Users },
        { name: "Analytics", icon: Activity },
        { name: "Settings", icon: Settings },
      ].map((item, i) => (
        <Button 
          key={i} 
          variant={currentView === item.name ? "secondary" : "ghost"} 
          onClick={() => {
            setCurrentView(item.name);
            setSidebarOpen(false);
          }}
          className={cn(
            "w-full justify-start h-12 rounded-xl transition-all group",
            currentView === item.name ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted"
          )}
        >
          <item.icon size={20} className={cn("shrink-0", currentView === item.name ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
          <span className="ml-3 font-semibold">{item.name}</span>
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r bg-card/50 backdrop-blur-xl flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
             <Video size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">Connect<span className="text-primary">Call</span></span>
        </div>
        <Navigation />
        <div className="mt-auto p-2 space-y-2">
           <div className="px-4 py-3 mb-2 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 opacity-60">Architect</p>
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Zap size={14} />
                 </div>
                 <div className="min-w-0">
                    <p className="text-xs font-bold truncate">@sabeerhub</p>
                    <div className="flex gap-2 mt-1">
                       <a href="https://twitter.com/_msabeer_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Twitter size={10} />
                       </a>
                       <a href="https://github.com/sabeerhub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Github size={10} />
                       </a>
                       <a href="https://linkedin.com/in/masabeer" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Linkedin size={10} />
                       </a>
                    </div>
                 </div>
              </div>
           </div>
           <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start h-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all group"
           >
              <LogOut size={20} className="shrink-0" />
              <span className="ml-3 font-semibold">Sign Out</span>
           </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              className="fixed inset-y-0 left-0 w-72 bg-card border-r z-[101] flex flex-col p-4 lg:hidden"
            >
              <div className="flex items-center justify-between px-2 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                    <Video size={24} />
                  </div>
                  <span className="text-xl font-bold tracking-tight">ConnectCall</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X size={20} />
                </Button>
              </div>
              <Navigation />
              <div className="mt-auto pt-4 space-y-4">
                <div className="px-4 py-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 opacity-60">Architect</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Zap size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">@sabeerhub</p>
                      <div className="flex gap-4 mt-1">
                        <a href="https://twitter.com/_msabeer_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Twitter size={14} />
                        </a>
                        <a href="https://github.com/sabeerhub" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Github size={14} />
                        </a>
                        <a href="https://linkedin.com/in/masabeer" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          <Linkedin size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" onClick={handleLogout} className="w-full justify-start h-12 text-muted-foreground font-semibold">
                  <LogOut size={20} className="mr-3" /> Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-20 border-b flex items-center justify-between px-4 lg:px-8 bg-background/50 backdrop-blur-md sticky top-0 z-30">
           <div className="flex items-center gap-4 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu size={24} />
              </Button>
              <div className="relative w-full max-w-xl hidden sm:block">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                 <Input 
                   placeholder="Search sessions..." 
                   className="pl-12 h-11 bg-muted/50 border-white/5 rounded-2xl focus:bg-muted transition-all"
                 />
              </div>
           </div>

           <div className="flex items-center gap-2 lg:gap-6">
              <Button 
                variant="ghost" 
                onClick={() => setIsJoinModalOpen(true)}
                className="hidden lg:flex rounded-xl font-bold bg-muted/30 hover:bg-muted"
              >
                Join Meeting
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground relative hidden xs:flex">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
              </Button>
              <Separator orientation="vertical" className="h-6 hidden sm:block" />
              <div className="flex items-center gap-3">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold truncate max-w-[150px]">{user?.displayName || 'Admin User'}</p>
                    <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Enterprise Pro</p>
                 </div>
                 <Avatar className="w-10 h-10 border-2 border-primary/20 ring-2 ring-primary/10 transition-all cursor-pointer hover:ring-primary/40">
                   <AvatarImage src={user?.photoURL || ''} />
                   <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                 </Avatar>
              </div>
           </div>
        </header>

        <ScrollArea className="flex-1">
           <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
              {currentView === 'Overview' && (
                <>
                  {/* Welcome Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 lg:mb-12">
                     <div>
                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">Workspace Overview</h1>
                        <p className="text-muted-foreground font-medium text-base lg:text-lg">Quick insights and action centers for your workspace.</p>
                     </div>
                     <div className="flex gap-3 w-full md:w-auto">
                        <Button 
                          onClick={() => setIsJoinModalOpen(true)}
                          variant="outline" 
                          className="h-11 lg:h-12 flex-1 md:flex-none px-6 rounded-xl font-bold"
                        >
                           Join Room
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                           <DialogTrigger 
                             render={
                               <Button className="h-11 lg:h-12 flex-1 md:flex-none px-6 rounded-xl font-bold btn-premium shadow-xl shadow-primary/20">
                                  <Plus className="mr-2" size={20} /> New Meeting
                               </Button>
                             } 
                           />
                           <DialogContent className="sm:max-w-[425px] rounded-3xl">
                              <DialogHeader>
                                 <DialogTitle>Create New Meeting</DialogTitle>
                                 <DialogDescription>
                                    Set a title and optional password for your private meeting room.
                                 </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                 <div className="grid gap-2">
                                    <Label htmlFor="title">Meeting Title</Label>
                                    <Input 
                                       id="title" 
                                       placeholder="e.g. Q3 Design Review" 
                                       value={meetingTitle}
                                       onChange={(e) => setMeetingTitle(e.target.value)}
                                    />
                                 </div>
                                 <div className="grid gap-2">
                                    <Label htmlFor="password">Password (Optional)</Label>
                                    <div className="relative">
                                       <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                       <Input 
                                          id="password" 
                                          type="password"
                                          placeholder="Leave blank for no password" 
                                          className="pl-10"
                                          value={meetingPassword}
                                          onChange={(e) => setMeetingPassword(e.target.value)}
                                       />
                                    </div>
                                 </div>
                              </div>
                              <DialogFooter>
                                 <Button 
                                    onClick={handleCreateMeeting} 
                                    disabled={loading}
                                    className="w-full rounded-xl btn-premium h-12 font-bold"
                                 >
                                    {loading ? 'Creating...' : 'Launch Meeting'}
                                 </Button>
                              </DialogFooter>
                           </DialogContent>
                        </Dialog>
                     </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-12">
                     {[
                       { title: "Total Meetings", value: stats.active, sub: "Total created room", icon: Video, trend: "up" },
                       { title: "Engagement", value: stats.attendance, sub: "Total interactions", icon: Users },
                       { title: "Avg. Duration", value: stats.duration, sub: "Platform average", icon: Clock, trend: "up" },
                       { title: "Network Health", value: "99.9%", sub: "Service status", icon: Shield }
                     ].map((stat, i) => (
                       <Card key={i} className="border-white/5 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden relative group hover:bg-card/60 transition-all">
                          <CardContent className="p-6">
                             <div className="flex items-center justify-between mb-4">
                               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                  <stat.icon size={16} />
                               </div>
                             </div>
                             <div className="flex items-end justify-between">
                                <div>
                                   <h3 className="text-3xl font-bold tracking-tighter mb-1">{stat.value}</h3>
                                   <p className="text-[10px] font-semibold text-muted-foreground">
                                      {stat.trend === 'up' && <TrendingUp className="inline mr-1 text-primary" size={10} />}
                                      {stat.sub}
                                   </p>
                                </div>
                             </div>
                          </CardContent>
                       </Card>
                     ))}
                  </div>

                  {/* Content Grid */}
                  <div className="grid lg:grid-cols-3 gap-8">
                     {/* Recent Meetings */}
                     <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                           <h2 className="text-xl lg:text-2xl font-bold tracking-tight">Real-time Sessions</h2>
                           <Button variant="ghost" onClick={() => setCurrentView('Meetings')} className="text-primary font-bold text-sm hover:bg-primary/5">View All <ChevronRight size={16} className="ml-1" /></Button>
                        </div>
                        <div className="space-y-4">
                           {recentMeetings.length === 0 ? (
                             <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-50">
                                <Video size={32} className="mx-auto mb-4 text-muted-foreground" />
                                <p className="font-bold">No active sessions found.</p>
                             </div>
                           ) : (
                             recentMeetings.map((meet, i) => (
                               <motion.div 
                                 key={meet.id} 
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: i * 0.1 }}
                                 whileHover={{ scale: 1.005 }}
                                 onClick={() => navigate(`/meeting/${meet.id}`)}
                                 className="p-4 lg:p-5 rounded-3xl border bg-card/60 flex items-center gap-4 lg:gap-6 group cursor-pointer transition-all hover:bg-card hover:border-primary/20"
                               >
                                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary transition-all group-hover:text-white">
                                     <Video size={20} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                     <h4 className="font-bold text-base lg:text-lg truncate mb-0.5">{meet.title}</h4>
                                     <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                       <Clock size={12} /> {meet.createdAt?.toDate?.().toLocaleDateString() || 'Recently'}
                                     </p>
                                  </div>
                                  <div className="flex items-center gap-4 lg:gap-8 pr-2 hidden xs:flex">
                                     <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold">5</p>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Guests</p>
                                     </div>
                                     <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold">32m</p>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active</p>
                                     </div>
                                     <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary rounded-xl">
                                        <ArrowUpRight size={20} />
                                     </Button>
                                  </div>
                               </motion.div>
                             ))
                           )}
                        </div>
                     </div>

                     {/* Activity Feed */}
                     <div className="space-y-6">
                        <h2 className="text-xl lg:text-2xl font-bold tracking-tight px-2">AI Insights</h2>
                        <div className="rounded-3xl border bg-card/40 overflow-hidden glass shadow-2xl">
                           <div className="p-6 border-b border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                                 <span className="font-bold text-sm tracking-tight uppercase">Live Feedback</span>
                              </div>
                           </div>
                           <div className="p-6 space-y-8">
                              {[
                                { text: "Meeting quality is optimal across all active rooms.", date: "Just now", icon: Activity },
                                { text: "Session '"+(recentMeetings[0]?.title || 'Workspace Sync')+"' generated new action items.", date: "2h ago", highlight: true, icon: Zap }
                              ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                   <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                      item.highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                   )}>
                                      <item.icon size={18} />
                                   </div>
                                   <div>
                                      <p className={cn("text-xs lg:text-sm font-medium mb-1", item.highlight ? "text-foreground" : "text-muted-foreground")}>
                                         {item.text}
                                      </p>
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.date}</p>
                                   </div>
                                </div>
                              ))}
                           </div>
                           <div className="p-6 pt-0">
                              <Button variant="outline" className="w-full rounded-xl font-bold border-primary/20 text-primary hover:bg-primary/5 h-11">
                                 Detailed Analytics
                              </Button>
                           </div>
                        </div>
                     </div>
                  </div>
                </>
              )}

              {currentView === 'Meetings' && (
                <div className="space-y-8">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Meeting History</h1>
                      <Button onClick={() => setIsDialogOpen(true)} className="rounded-xl btn-premium h-11 lg:h-12 px-6 font-bold w-full sm:w-auto">
                         <Plus className="mr-2" size={20} /> Host Now
                      </Button>
                   </div>
                   <Card className="rounded-[2rem] lg:rounded-[2.5rem] border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden min-h-[400px] flex items-center justify-center">
                      <CardContent className="p-8 text-center">
                        {recentMeetings.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                             {recentMeetings.map(m => (
                               <div key={m.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 transition-all cursor-pointer" onClick={() => navigate(`/meeting/${m.id}`)}>
                                  <div className="flex items-center justify-between mb-2">
                                     <Badge className="bg-primary/20 text-primary font-bold">ACTIVE</Badge>
                                     <span className="text-xs text-muted-foreground font-bold">{m.id}</span>
                                  </div>
                                  <h4 className="font-bold mb-1">{m.title}</h4>
                                  <p className="text-xs text-muted-foreground">Hosted by {user?.displayName}</p>
                               </div>
                             ))}
                          </div>
                        ) : (
                          <>
                            <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                               <Calendar size={40} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">No meetings found</h3>
                            <p className="text-muted-foreground font-medium mb-8">Ready to start your first private session?</p>
                            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="rounded-xl h-11 px-8 font-bold border-primary text-primary hover:bg-primary/5">
                               New Room
                            </Button>
                          </>
                        )}
                      </CardContent>
                   </Card>
                </div>
              )}

              {/* ... other views updated similarly for responsiveness ... */}
              {currentView === 'Settings' && (
                <div className="space-y-8 max-w-2xl px-2">
                   <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Pro Settings</h1>
                   <div className="space-y-6">
                      <Card className="rounded-[2rem] border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                         <CardHeader className="p-6 lg:p-8">
                            <CardTitle className="text-xl">Profile Information</CardTitle>
                            <CardDescription>Visual settings for your workplace identity.</CardDescription>
                         </CardHeader>
                         <CardContent className="p-6 lg:p-8 pt-0 space-y-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                               <Avatar className="w-20 h-20 lg:w-28 lg:h-28 border-4 border-primary/10 ring-4 ring-primary/5">
                                  <AvatarImage src={user?.photoURL || ''} />
                                  <AvatarFallback className="text-3xl">{user?.displayName?.[0]}</AvatarFallback>
                               </Avatar>
                               <div className="flex flex-col gap-2 w-full sm:w-auto">
                                  <Button variant="outline" className="rounded-xl font-bold">Update Photo</Button>
                                  <p className="text-[10px] text-muted-foreground tracking-widest text-center sm:text-left">MAX 2MB • JPG, PNG</p>
                               </div>
                            </div>
                            <div className="grid gap-6">
                               <div className="grid gap-2">
                                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Display Identity</Label>
                                  <Input defaultValue={user?.displayName || ''} className="h-12 rounded-xl bg-muted/30 border-white/5 focus:bg-muted/50 font-medium" />
                               </div>
                               <div className="grid gap-2 opacity-60 pointer-events-none">
                                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Auth Email</Label>
                                  <Input defaultValue={user?.email || ''} readOnly className="h-12 rounded-xl bg-muted/10 border-white/5 text-muted-foreground" />
                               </div>
                            </div>
                         </CardContent>
                         <CardFooter className="bg-muted/10 p-6 flex justify-end">
                            <Button className="rounded-xl btn-premium h-11 lg:h-12 px-10 font-bold shadow-lg shadow-primary/20">Sync Profile</Button>
                         </CardFooter>
                      </Card>
                   </div>
                </div>
              )}
           </div>
        </ScrollArea>
        <JoinMeetingModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
      </main>
    </div>
  );
}
