import { Button } from '@/components/ui/button';
import { Mic, CheckCircle, BarChart3, Zap, ArrowRight, Play, Sparkles, Shield, Cpu, Github, Twitter, Linkedin } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-white" />,
      title: 'Neural Voice Engine',
      description: 'Experience industry-leading accuracy with our custom-trained NLP models designed specifically for productivity intent.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: <Cpu className="w-8 h-8 text-white" />,
      title: 'Contextual Logic',
      description: 'VoXa doesn’t just hear you; it understands the structure of your week, automatically clustering related objectives.',
      color: 'from-violet-600 to-purple-600',
    },
    {
      icon: <Zap className="w-8 h-8 text-white" />,
      title: 'Zero Latency Sync',
      description: 'Proprietary edge-computing ensures your voice commands are indexed and mirrored across your workspace in milliseconds.',
      color: 'from-amber-600 to-orange-600',
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: 'Vault Security',
      description: 'Your voice is your own. We utilize local-first processing for sensitive commands and enterprise-grade encryption for sync.',
      color: 'from-emerald-600 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] animate-mesh" 
        />
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-500/10 rounded-full blur-[150px] animate-mesh" 
           style={{ animationDelay: '3s' }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] contrast-150" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-2xl px-6">
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent-500 p-[2px] shadow-lg shadow-primary/20"
            >
              <div className="w-full h-full bg-background rounded-[14px] flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="VoXa" className="w-8 h-8 object-contain" />
              </div>
            </motion.div>
            <span className="text-3xl font-black tracking-tighter text-foreground">
              VoXa
            </span>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-10 text-xs font-black uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="transition-all hover:text-primary hover:tracking-[0.2em]">Framework</a>
            <a href="#demo" className="transition-all hover:text-primary hover:tracking-[0.2em]">Interface</a>
            <a href="#security" className="transition-all hover:text-primary hover:tracking-[0.2em]">Encryption</a>
          </nav>

          <div className="flex items-center space-x-6">
            <button onClick={handleLogin} className="hidden sm:block text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign In
            </button>
            <Button 
               onClick={handleLogin}
               className="h-12 rounded-2xl px-8 font-black text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-24 pb-40 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 rounded-full border-2 border-primary/20 bg-primary/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-12 shadow-inner"
            >
              <Sparkles className="h-4 w-4" />
              Neural task management system
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-12"
            >
              COMMAND YOUR <br />
              <span className="relative inline-block pb-4">
                 <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-500 to-indigo-600">
                    MOMENTUM
                 </span>
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute bottom-0 left-0 h-4 bg-primary/20 rounded-full blur-md" 
                 />
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-3xl text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed mb-16 px-4"
            >
              The first voice-native productivity suite built for modern professionals. 
              Turn natural speech into structured workflows with zero friction.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <Button size="lg" className="h-16 px-12 rounded-[1.5rem] text-lg font-black bg-foreground text-background hover:bg-foreground/90 shadow-2xl transition-all hover:scale-105 active:scale-95" onClick={handleLogin}>
                Access Console <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
              <Button size="lg" variant="outline" className="h-16 px-12 rounded-[1.5rem] text-lg font-black border-2 hover:bg-muted transition-all">
                <Play className="mr-3 w-5 h-5 fill-current" /> System Demo
              </Button>
            </motion.div>

            {/* Premium Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative mt-32 w-full max-w-6xl"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent-500/30 rounded-[3rem] blur-2xl opacity-50" />
              <div className="relative rounded-[2.5rem] border-2 border-border/50 bg-card/60 p-4 shadow-3xl backdrop-blur-3xl overflow-hidden aspect-video group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-500/5 transition-opacity group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                
                <div className="relative h-full w-full rounded-[1.5rem] bg-background border border-border/50 flex items-center justify-center">
                    <motion.div 
                       animate={{ 
                         scale: [1, 1.05, 1],
                         opacity: [0.5, 0.8, 0.5]
                       }}
                       transition={{ duration: 4, repeat: Infinity }}
                       className="absolute w-[60%] h-[60%] bg-primary/10 rounded-full blur-[80px]" 
                    />
                    <div className="z-10 flex flex-col items-center gap-10">
                       <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="w-32 h-32 rounded-[2.5rem] bg-primary flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary),0.3)] cursor-pointer"
                        >
                         <Mic className="w-14 h-14 text-white" />
                       </motion.div>
                       <div className="space-y-4 text-center">
                          <h4 className="text-xl font-black text-foreground/80 tracking-tight">Listening for instructions...</h4>
                          <div className="flex gap-2 justify-center">
                             {[1,2,3,4,5].map(i => (
                               <motion.div 
                                 key={i}
                                 animate={{ height: [10, 40, 10] }}
                                 transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                 className="w-1.5 bg-primary/30 rounded-full" 
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

        {/* Feature Grid */}
        <section id="features" className="py-40 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Capabilities</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight">Engineered for Velocity.</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative p-10 rounded-[2.5rem] border-2 border-border/50 bg-card hover:bg-background transition-all duration-500 hover:shadow-2xl overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-all duration-700`} />
                  
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center p-4 mb-10 shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-black mb-6 tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-12 md:p-24 rounded-[4rem] bg-foreground text-background overflow-hidden text-center group"
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-full bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 space-y-10 max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                   RECLAIM YOUR <br /> COGNITIVE LOAD.
                </h2>
                <p className="text-xl md:text-2xl text-background/70 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join the elite tier of efficient operators who have automated their 
                  task logistics through neural voice control.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                   <Button onClick={handleLogin} size="lg" className="h-20 px-12 rounded-[2rem] text-xl font-black bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                      Initialize Free Access
                   </Button>
                   <div className="text-left hidden md:block">
                      <p className="text-xs font-black uppercase tracking-widest text-background/40 mb-1">Trusted By</p>
                      <div className="flex -space-x-3">
                         {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-foreground bg-muted" />)}
                         <div className="w-8 h-8 rounded-full border-2 border-foreground bg-primary flex items-center justify-center text-[10px] font-black">+</div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-24 bg-card/10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between gap-20">
            <div className="space-y-8 max-w-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <img src="/logo.png" alt="VoXa" className="w-6 h-6 grayscale" />
                </div>
                <span className="text-3xl font-black tracking-tighter">VoXa</span>
              </div>
              <p className="text-muted-foreground font-medium text-lg">
                The nexus of artificial intelligence and personal logistics. 
                Built for the speed of modern thought.
              </p>
              <div className="flex items-center gap-4">
                 {[Github, Twitter, Linkedin].map((Icon, i) => (
                   <button key={i} className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all">
                     <Icon className="w-5 h-5" />
                   </button>
                 ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Product</h4>
                 <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">Neural Engine</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Interface API</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Security Audit</a></li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Company</h4>
                 <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                    <li><a href="#" className="hover:text-primary transition-colors">Vision</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Privacy Lexicon</a></li>
                    <li><a href="#" className="hover:text-primary transition-colors">Contact Stack</a></li>
                 </ul>
              </div>
              <div className="hidden md:block space-y-6">
                 <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">System Status</h4>
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 w-fit">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">All Systems Operational</span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
              © 2025 Voxa Intelligent Systems, Inc. / Global Distribution
            </p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
               <a href="#" className="hover:text-primary transition-colors">Security Protocol</a>
               <a href="#" className="hover:text-primary transition-colors">Data Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
