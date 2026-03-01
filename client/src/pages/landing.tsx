import { Button } from '@/components/ui/button';
import { Mic, ArrowRight, Zap, CheckCircle2, Star, Shield, Layout, Sparkles, Globe, Brain, Calendar, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import heroGif from '@/assets/hero.gif';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: <Mic className="w-6 h-6 text-primary" />,
      title: 'Voice-First Input',
      description: 'Capture tasks instantly just by speaking. Our AI understands naturally spoken context and intent.',
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: 'Smart Organization',
      description: 'Automatically categorize and prioritize tasks based on your voice commands and deadlines.',
    },
    {
      icon: <Calendar className="w-6 h-6 text-primary" />,
      title: 'Contextual Scheduling',
      description: 'Deadlines and reminders are automatically extracted and added to your calendar.',
    },
    {
      icon: <Bell className="w-6 h-6 text-primary" />,
      title: 'Proactive Reminders',
      description: 'Never miss a beat with intelligent notifications that adapt to your workflow.',
    },
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: 'Secure & Private',
      description: 'Your voice data is processed securely and encrypted. Your privacy is our top priority.',
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: 'Across All Devices',
      description: 'Sync your tasks seamlessly across web and mobile. Your productivity, everywhere.',
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground transition-colors duration-300 relative overflow-hidden">
      {/* Background Effects */}
      <div className="mesh-gradient opacity-60 dark:opacity-40" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/5 dark:border-white/ border-border/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
              <Zap className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gradient">VoXa</span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
            <a href="#features" className="hover:text-primary transition-colors hover:tracking-[0.2em] duration-300">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors hover:tracking-[0.2em] duration-300">How it Works</a>
            <a href="#about" className="hover:text-primary transition-colors hover:tracking-[0.2em] duration-300">About</a>
          </div>

          <div className="flex items-center gap-6">
            <Button variant="ghost" onClick={handleLogin} className="text-sm font-bold uppercase tracking-widest hidden sm:flex hover:bg-primary/5">Log In</Button>
            <Button onClick={handleLogin} className="rounded-full px-8 h-12 font-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 active:scale-95 transition-all">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-44 pb-24 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-10 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Intelligence & Voice</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-gradient">
                Speak it into <br />
                <span className="text-primary opacity-90">Existence.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                The high-performance mission control for your daily objectives. Driven by <span className="text-foreground font-bold italic underline decoration-primary/30">voice API intelligence</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Button size="lg" onClick={handleLogin} className="h-16 px-12 rounded-2xl text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all">
                  Launch App <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl text-lg font-black uppercase tracking-widest border-2 hover:bg-muted/30 transition-all">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-10 pt-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5, zIndex: 10 }}
                      className="w-12 h-12 rounded-2xl border-4 border-background bg-muted overflow-hidden shadow-lg"
                    >
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 15}`} alt="User avatar" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-left">
                   <div className="flex text-amber-500 mb-1 gap-0.5">
                     {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                   </div>
                   <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                     <span className="text-foreground">1,200+</span> Optimized Workflows
                   </p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="relative group"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden border-8 border-white/5 dark:border-white/5 bg-card shadow-[0_0_100px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-[1.02]">
                <div className="h-12 border-b border-border/10 bg-muted/20 flex items-center px-6 gap-2">
                   <div className="w-3 h-3 rounded-full bg-rose-500/40" />
                   <div className="w-3 h-3 rounded-full bg-amber-500/40" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                   <div className="ml-auto flex items-center gap-4">
                      <div className="h-1.5 w-24 bg-muted-foreground/10 rounded-full" />
                      <Layout className="w-4 h-4 text-muted-foreground/20" />
                   </div>
                </div>
                <div className="aspect-[16/11] bg-muted/5 relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                  <img 
                    src={heroGif} 
                    alt="VoXa Interface Demo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Decorative Floating Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 p-5 rounded-2xl glass shadow-2xl border-white/20 hidden md:block"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">System</p>
                       <p className="text-sm font-bold">Objectives Synced</p>
                    </div>
                 </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-10 p-5 rounded-2xl glass shadow-2xl border-white/20 hidden md:block"
              >
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                       <Mic className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Voice</p>
                       <p className="text-sm font-bold">Heuristic Listening</p>
                    </div>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Logos / Social Proof */}
        <section className="py-20 border-y border-border/10 bg-muted/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white pointer-events-none opacity-20" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-12">Engineered for Peak Performance</p>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-32 opacity-20 grayscale hover:grayscale-0 transition-all duration-700">
               <span className="text-3xl font-black tracking-tighter italic">NEURAL</span>
               <span className="text-3xl font-black tracking-tighter uppercase">Nexus</span>
               <span className="text-3xl font-black tracking-tighter">Velocity</span>
               <span className="text-3xl font-black tracking-tighter">Optima</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-40 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-32 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                 Core Architecture
              </div>
              <h3 className="text-5xl md:text-6xl font-black tracking-tighter text-gradient leading-tight">Master your time with <br />Heuristic Intelligence.</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
                Strategic task management re-imagined through high-fidelity voice recognition and automated contextual parsing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="premium-card p-10 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-all duration-500 shadow-inner group-hover:shadow-primary/20">
                    {feature.icon}
                  </div>
                  <h4 className="text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    {feature.description}
                  </p>
                  
                  <div className="mt-8 pt-8 border-t border-border/10 flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Feature {idx + 1}</span>
                     <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Highlight */}
        <section className="py-20 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="glass border-white/5 rounded-[3rem] p-10 md:p-20 flex flex-col md:grid md:grid-cols-2 gap-20 items-center shadow-3xl">
                 <div className="space-y-10">
                   <div className="space-y-4">
                      <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Contextual Engine</p>
                      <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight italic">"Remind me to finalize the project specs by Friday at 5 PM."</h3>
                   </div>
                    <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                      VoXa's neural parser identifies <span className="text-foreground font-black underline decoration-primary/40">Action Intent</span>, <span className="text-foreground font-black underline decoration-primary/40">Category Tags</span>, and <span className="text-foreground font-black underline decoration-primary/40">Temporal Deadlines</span> in real-time.
                    </p>
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-primary/5 border border-primary/10 w-fit">
                       <Zap className="w-6 h-6 text-primary" />
                       <span className="font-black text-sm uppercase tracking-widest text-primary">Zero Latency Processing</span>
                    </div>
                 </div>
                 <div className="relative w-full max-w-lg ml-auto">
                    <div className="absolute inset-0 bg-primary/20 blur-[120px] -z-10 animate-pulse" />
                    <div className="bg-card/80 backdrop-blur-3xl border-4 border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
                       <div className="flex items-center gap-6">
                          <motion.div 
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-14 h-14 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20"
                          >
                             <Mic className="w-7 h-7" />
                          </motion.div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Status</p>
                             <p className="text-lg font-black tracking-tight">Listening...</p>
                             <div className="flex gap-1.5 mt-2">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                  <motion.div 
                                    key={i} 
                                    animate={{ height: [6, 20, 6] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                                    className="w-1.5 bg-rose-500 rounded-full" 
                                  />
                                ))}
                             </div>
                          </div>
                       </div>
                       <div className="p-8 rounded-3xl bg-muted/40 border border-border/10 space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Parsed Output</span>
                             <Sparkles className="w-4 h-4 text-primary" />
                          </div>
                          <p className="text-xl font-black tracking-tight">Finalize project specs</p>
                          <div className="flex items-center gap-3 text-primary">
                             <Calendar className="w-5 h-5" />
                             <span className="text-xs font-black uppercase tracking-widest">Friday, 17:00</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-48 px-6 relative overflow-hidden">
          <div className="absolute inset-0 mesh-gradient opacity-30" />
          <div className="max-w-5xl mx-auto text-center space-y-16 relative z-10">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] text-gradient">
              Elevate your <br />
              <span className="text-primary italic">Output.</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Step into the future of high-frequency task management. <br />Available now for professionals who demand speed.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
              <Button size="lg" onClick={handleLogin} className="h-20 px-16 rounded-2xl text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:shadow-primary/60 hover:-translate-y-2 active:translate-y-0 transition-all duration-500">
                Execute Onboard
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="pt-32 pb-16 px-6 border-t border-border/10 bg-muted/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
            <div className="md:col-span-2 space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Zap className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="text-2xl font-black tracking-tighter">VoXa</span>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed font-medium text-lg italic opacity-60">
                "The most efficient way to manage complex workflows is to speak them into existence."
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground/40">Infrastructure</h4>
              <ul className="space-y-4">
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest hover:pl-2">Nodes</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest hover:pl-2">Operations</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest hover:pl-2">Security</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-foreground/40">Division</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest hover:pl-2">Intelligence</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest hover:pl-2">Compliance</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-all text-sm font-bold uppercase tracking-widest hover:pl-2">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-16 border-t border-border/10 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">© 2026 VOXA STRATEGIC. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10 text-xs font-black uppercase tracking-widest text-muted-foreground/40">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              <a href="#" className="hover:text-primary transition-colors">Terminal</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

