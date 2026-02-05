import { Button } from '@/components/ui/button';
import { Mic, Zap, ArrowRight, Play, Sparkles, Shield, Cpu, Github, Twitter, Linkedin, Globe, Lock, Workflow } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-white" />,
      title: 'Neural Voice Engine',
      description: 'Experience industry-leading accuracy with our custom-trained NLP models designed specifically for high-velocity environments.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: <Cpu className="w-8 h-8 text-white" />,
      title: 'Contextual Logic',
      description: 'VoXa autonomously structures your workflow, automatically clustering related objectives and prioritizing based on intent.',
      color: 'from-violet-600 to-purple-600',
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: 'Zero Latency Sync',
      description: 'Proprietary edge-computing ensures your voice commands are indexed and mirrored across your ecosystem instantly.',
      color: 'from-amber-600 to-orange-600',
    },
    {
      icon: <Lock className="w-8 h-8 text-white" />,
      title: 'Vault Protection',
      description: 'Your biometric data remains local. We utilize industry-standard encryption for all cloud-synchronized parameters.',
      color: 'from-emerald-600 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl px-6">
        <div className="max-w-7xl mx-auto flex h-24 items-center justify-between">
          <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 p-[2px] shadow-2xl shadow-primary/20 group-hover:rotate-6 transition-transform">
              <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="VoXa" className="w-9 h-9 object-contain" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-foreground">VoXa</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol v2.0</span>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-12 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            <a href="#features" className="transition-all hover:text-primary hover:tracking-[0.4em]">Engine</a>
            <a href="#workflow" className="transition-all hover:text-primary hover:tracking-[0.4em]">Workflow</a>
            <a href="#security" className="transition-all hover:text-primary hover:tracking-[0.4em]">Encryption</a>
          </nav>

          <div className="flex items-center space-x-8">
            <button onClick={handleLogin} className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all">
              Login Console
            </button>
            <Button 
               onClick={handleLogin}
               className="h-14 rounded-2xl px-10 font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              Initialize Access
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-48 px-6 text-center">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 rounded-full border-2 border-primary/20 bg-primary/5 px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-16 shadow-inner"
            >
              <Workflow className="h-4 w-4" />
              Next-Gen Neural Productivity System
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-12"
            >
              COMMAND YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-indigo-400">MOMENTUM.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl mx-auto text-2xl md:text-3xl text-muted-foreground/80 font-medium leading-relaxed mb-20 px-4"
            >
              The first voice-native workspace designed for high-stakes execution. 
              Eliminate friction and orchestrate your entire day with natural speech.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-8 justify-center items-center"
            >
              <Button size="lg" className="h-20 px-16 rounded-[2rem] text-xl font-black bg-foreground text-background hover:bg-foreground/90 shadow-3xl transition-all hover:scale-105 active:scale-95" onClick={handleLogin}>
                Access Console <ArrowRight className="ml-4 w-7 h-7" />
              </Button>
              <Button size="lg" variant="ghost" className="h-20 px-16 rounded-[2rem] text-xl font-black border-2 border-transparent hover:border-border transition-all">
                <Play className="mr-4 w-6 h-6 fill-current" /> System Brief
              </Button>
            </motion.div>

            {/* Premium Interactive Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative mt-40 w-full max-w-6xl mx-auto"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full opacity-30 animate-pulse" />
              <div className="relative rounded-[3.5rem] border-2 border-border/40 bg-card/60 p-6 shadow-3xl backdrop-blur-3xl overflow-hidden aspect-[16/9]">
                <div className="h-full w-full rounded-[2.5rem] bg-background border border-border/40 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-dot-pattern opacity-[0.05]" />
                    <motion.div 
                       animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                       transition={{ duration: 8, repeat: Infinity }}
                       className="absolute w-full h-full bg-primary/5 rounded-full blur-[100px]" 
                    />
                    <div className="z-10 flex flex-col items-center gap-12">
                       <motion.div 
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-40 h-40 rounded-[3rem] bg-primary flex items-center justify-center shadow-3xl shadow-primary/30 cursor-pointer relative"
                        >
                         <Mic className="w-16 h-16 text-white" />
                         <motion.div 
                           animate={{ scale: [1, 1.5, 1], opacity: [0, 0.3, 0] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="absolute inset-0 rounded-[3rem] border-4 border-primary" 
                         />
                       </motion.div>
                       <div className="space-y-6 text-center">
                          <h4 className="text-3xl font-black text-foreground tracking-tight">Syncing Voice Parameters...</h4>
                          <div className="flex gap-4 justify-center">
                             {[1,2,3,4,5,6,7].map(i => (
                               <motion.div 
                                 key={i}
                                 animate={{ height: [12, 60, 12] }}
                                 transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                                 className="w-2 bg-primary/40 rounded-full" 
                               />
                             ))}
                          </div>
                       </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid with Hover Effects */}
        <section id="features" className="py-64 px-6 bg-muted/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.03]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-32 space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">System Capabilities</h2>
              <h3 className="text-6xl md:text-8xl font-black tracking-tighter">Unified Intelligence.</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="group relative p-12 rounded-[3.5rem] border-2 border-border/40 bg-card/50 backdrop-blur-md hover:bg-background transition-all duration-700 hover:shadow-3xl overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-[80px] transition-all duration-1000`} />
                  
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center p-5 mb-12 shadow-2xl shadow-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-3xl font-black mb-8 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground/80 text-xl leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-20 md:p-32 rounded-[5rem] bg-foreground text-background overflow-hidden text-center group"
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 space-y-12 max-w-5xl mx-auto">
                <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.85]">
                   RECLAIM YOUR <br /> COGNITION.
                </h2>
                <p className="text-2xl md:text-3xl text-background/60 max-w-3xl mx-auto font-medium leading-relaxed">
                  The future of productivity isn't manual. It's neural. 
                  Deploy VoXa across your entire operation today.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                   <Button onClick={handleLogin} size="lg" className="h-24 px-16 rounded-[2.5rem] text-2xl font-black bg-primary text-white hover:bg-white hover:text-primary shadow-3xl shadow-primary/40 transition-all hover:scale-105 active:scale-95">
                      Initialize Free Access
                   </Button>
                   <div className="text-left hidden md:flex items-center gap-6">
                      <div className="flex -space-x-4">
                         {[1,2,3,4].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-foreground bg-muted-foreground/20" />)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black leading-none">5,000+</span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Operators</span>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-32 bg-card/20 px-6 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-32">
            <div className="space-y-10 max-w-md">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <img src="/logo.png" alt="VoXa" className="w-9 h-9 grayscale opacity-50" />
                </div>
                <div className="flex flex-col">
                  <span className="text-4xl font-black tracking-tighter">VoXa</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Intelligence Stack</span>
                </div>
              </div>
              <p className="text-muted-foreground/60 font-medium text-xl leading-relaxed">
                Architecting the nexus of high-fidelity voice recognition 
                and autonomous personal logistics.
              </p>
              <div className="flex items-center gap-6">
                 <a href="https://github.com/portgasdyamato" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-muted/30 border-2 border-border/40 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all">
                   <Github className="w-5 h-5" />
                 </a>
                 <button className="w-12 h-12 rounded-2xl bg-muted/30 border-2 border-border/40 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all opacity-50 cursor-not-allowed">
                   <Twitter className="w-5 h-5" />
                 </button>
                 <a href="https://www.linkedin.com/in/ethsakshi/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-muted/30 border-2 border-border/40 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all">
                   <Linkedin className="w-5 h-5" />
                 </a>
                 <a href="https://pippoportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-muted/30 border-2 border-border/40 flex items-center justify-center hover:bg-primary/20 hover:text-primary hover:border-primary/40 transition-all">
                   <Globe className="w-5 h-5" />
                 </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-16 lg:gap-32">
              <div className="space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Infrastructure</h4>
                 <ul className="space-y-5 text-sm font-black text-muted-foreground/60 transition-all uppercase tracking-widest">
                    <li className="hover:text-primary cursor-pointer transition-colors">Neural Core</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Edge Nodes</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Quantum Sync</li>
                 </ul>
              </div>
              <div className="space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Organization</h4>
                 <ul className="space-y-5 text-sm font-black text-muted-foreground/60 transition-all uppercase tracking-widest">
                    <li className="hover:text-primary cursor-pointer transition-colors">Manifesto</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Privacy Lexicon</li>
                    <li className="hover:text-primary cursor-pointer transition-colors">Security Audit</li>
                 </ul>
              </div>
              <div className="hidden md:block space-y-8">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Status</h4>
                 <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/5 border-2 border-emerald-500/20 w-fit animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Systems Nominal</span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mt-40 pt-10 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
              © 2026 Voxa Intelligent Systems, Inc. / Earth-Based Operations
            </p>
            <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
               <a href="#" className="hover:text-primary transition-colors">Security Layer-4</a>
               <a href="#" className="hover:text-primary transition-colors">User Privacy Index</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
