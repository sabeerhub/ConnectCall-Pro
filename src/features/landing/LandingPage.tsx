import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Video, Shield, Zap, Globe, Github, ArrowRight, CheckCircle, Users, Layout, Mic, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Video size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">Connect<span className="text-primary">Call</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground mr-8">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#enterprise" className="hover:text-foreground transition-colors">Enterprise</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
            <Button onClick={onGetStarted} className="btn-premium shadow-xl shadow-primary/10">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 border-primary/20 text-primary bg-primary/5">
              ✨ Next-gen AI Communication
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Reimagining <br />
              <span className="text-gradient">Human Connection</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg font-medium">
              Experience ultra-low latency, cinematic clarity, and AI-powered insights in every conversation. Built for the modern enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onGetStarted} size="lg" className="h-14 px-8 text-lg rounded-2xl btn-premium">
                Start a Meeting <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl border-white/10 hover:bg-white/5">
                Join a Call
              </Button>
            </div>
            <div className="mt-12 flex items-center gap-6">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                  ))}
               </div>
               <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-semibold">10k+</span> creators already connected
               </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
            style={{ y: y1 }}
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden glass shadow-2xl shadow-black/20">
               <img 
                 src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" 
                 alt="App Preview"
                 className="w-full h-full object-cover opacity-80"
                 referrerPolicy="no-referrer"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="flex items-center gap-4 w-full">
                     <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary shadow-lg shadow-primary/20">
                        <img src="https://i.pravatar.cc/100?img=12" alt="Host" />
                     </div>
                     <div className="flex-1">
                        <p className="text-white font-medium">Sarah Jenkins 🌿</p>
                        <p className="text-white/60 text-xs uppercase tracking-widest">Designing the Future</p>
                     </div>
                     <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-white">
                           <Mic size={14} />
                        </div>
                        <div className="w-8 h-8 rounded-full glass flex items-center justify-center text-white">
                           <Video size={14} />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Floating UI elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 glass p-4 rounded-2xl shadow-xl w-48 hidden sm:block"
            >
               <div className="flex items-center gap-2 mb-2">
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-xs font-bold uppercase tracking-tight">AI Insights</span>
               </div>
               <div className="space-y-1.5">
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: "80%" }} transition={{ duration: 1.5 }} className="h-full bg-primary" />
                  </div>
                  <div className="h-1.5 w-[60%] bg-white/10 rounded-full" />
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-white/5 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-[0.2em] mb-12">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default">
               <span className="text-2xl font-bold tracking-tighter">LINEAR</span>
               <span className="text-2xl font-bold tracking-tighter">NOTION</span>
               <span className="text-2xl font-bold tracking-tighter">VERCEL</span>
               <span className="text-2xl font-bold tracking-tighter">APPLE</span>
               <span className="text-2xl font-bold tracking-tighter">ARC</span>
            </div>
         </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
               <h2 className="text-4xl md:text-5xl font-bold mb-6">Engineered for <span className="text-gradient">Excellence</span></h2>
               <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Every pixel, every frame, every packet - optimized for the most demanding teams.
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "Crystal HD Voice", icon: Mic, desc: "Noise suppression and echo cancellation powered by advanced AI algorithms." },
                 { title: "Smart Layouts", icon: Layout, desc: "Intelligent participant grid that adapts to active speakers and content sharing." },
                 { title: "AI Transcription", icon: MessageSquare, desc: "Real-time, multi-language transcription and smart summaries of every call." },
                 { title: "Global Network", icon: Globe, desc: "Proprietary edge network ensuring <50ms latency across the globe." },
                 { title: "E2E Encryption", icon: Shield, desc: "Enterprise-grade security with end-to-end encryption for total privacy." },
                 { title: "Instant Magic", icon: Zap, desc: "No downloads, no logins for guests. Just click and connect instantly." }
               ].map((f, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -5 }}
                   className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
                 >
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                       <f.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                       {f.desc}
                    </p>
                 </motion.div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
         <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden bg-primary px-8 md:px-16 py-20 text-center text-white shadow-2xl shadow-primary/20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.3),transparent)]" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
               <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10 leading-tight">
                  Ready to upgrade your <br className="hidden sm:block" /> team's communication?
               </h2>
               <p className="text-xl text-white/80 mb-12 relative z-10 max-w-xl mx-auto">
                  Join 10,000+ teams using ConnectCall to build meaningful connections every single day.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                  <Button onClick={onGetStarted} variant="secondary" size="lg" className="h-14 px-10 text-lg rounded-2xl font-bold bg-white text-primary hover:bg-white/90">
                     Join for Free
                  </Button>
                  <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl border-white/20 text-white hover:bg-white/10">
                     Contact Sales
                  </Button>
               </div>
            </motion.div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div>
               <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                     <Video size={18} />
                  </div>
                  <span className="text-xl font-bold tracking-tight">Connect<span className="text-primary">Call</span></span>
               </div>
               <p className="text-muted-foreground text-sm max-w-xs">
                  The future of real-time communication. Built for the distributed world.
               </p>
            </div>
            <div className="flex gap-12 flex-wrap">
               <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Product</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                     <li className="hover:text-foreground cursor-pointer transition-colors">Features</li>
                     <li className="hover:text-foreground cursor-pointer transition-colors">Enterprise</li>
                     <li className="hover:text-foreground cursor-pointer transition-colors">Security</li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Resources</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                     <li className="hover:text-foreground cursor-pointer transition-colors">Documentation</li>
                     <li className="hover:text-foreground cursor-pointer transition-colors">Blog</li>
                     <li className="hover:text-foreground cursor-pointer transition-colors">Support</li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <h4 className="font-bold text-sm uppercase tracking-widest text-primary">Company</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                     <li className="hover:text-foreground cursor-pointer transition-colors">About</li>
                     <li className="hover:text-foreground cursor-pointer transition-colors">Careers</li>
                     <li className="hover:text-foreground cursor-pointer transition-colors">Privacy</li>
                  </ul>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto pt-20 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-muted-foreground font-medium uppercase tracking-[0.2em]">
            <p>© 2024 CONNECT CALL SYSTEMS INC. CRAFTED BY <a href="https://github.com/sabeerhub" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">SABEER</a>.</p>
            <div className="flex gap-8">
               <a href="https://twitter.com/_msabeer_" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter</a>
               <a href="https://github.com/sabeerhub" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Github</a>
               <a href="https://linkedin.com/in/masabeer" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>
            </div>
         </div>
      </footer>
    </div>
  );
}
