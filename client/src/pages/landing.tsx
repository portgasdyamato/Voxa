import { Button } from '@/components/ui/button';
import { Mic, Zap, ArrowRight, Play, CheckCircle, Shield, Clock, Github, Linkedin, Globe, Calendar, ListTodo, Sparkles, Brain, Bell } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: <Mic className="w-7 h-7 text-white" />,
      title: 'Voice-First Creation',
      description: 'Simply speak your tasks naturally. VoXa understands context and automatically organizes everything.',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    },
    {
      icon: <Brain className="w-7 h-7 text-white" />,
      title: 'Smart Organization',
      description: 'AI-powered categorization, priority detection, and intelligent task grouping.',
      color: 'from-violet-500 to-purple-500',
      gradient: 'bg-gradient-to-br from-violet-500/10 to-purple-500/10',
    },
    {
      icon: <Bell className="w-7 h-7 text-white" />,
      title: 'Smart Reminders',
      description: 'Never miss a deadline with contextual notifications and flexible reminder options.',
      color: 'from-amber-500 to-orange-500',
      gradient: 'bg-gradient-to-br from-amber-500/10 to-orange-500/10',
    },
    {
      icon: <Shield className="w-7 h-7 text-white" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted end-to-end. We take privacy seriously with industry-standard protection.',
      color: 'from-emerald-500 to-teal-500',
      gradient: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          style={{ y }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px]" 
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.03),rgba(255,255,255,0))]" />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl px-6"
      >
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tracking-tight">VoXa</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Voice Tasks</span>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
               onClick={handleLogin}
               className="h-11 rounded-xl px-8 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Get Started
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-40 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-5 py-2 text-xs font-bold text-primary mb-8 backdrop-blur-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Voice-Powered Task Management
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8"
              >
                Speak Your Tasks,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500 animate-gradient">
                  Get Things Done
                </span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground leading-relaxed mb-12 font-medium"
              >
                Stop typing. Start speaking. VoXa transforms your voice into organized, prioritized tasks with intelligent reminders.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="h-16 px-12 rounded-2xl text-lg font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all" onClick={handleLogin}>
                    Start Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="h-16 px-12 rounded-2xl text-lg font-bold border-2">
                    <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Interactive Voice Demo */}
              <motion.div 
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="relative w-full max-w-5xl mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-indigo-500/20 to-purple-500/20 blur-[100px] opacity-50 animate-pulse" />
                <div className="relative rounded-[2.5rem] border-2 border-border/40 bg-card/40 p-2 shadow-2xl backdrop-blur-2xl overflow-hidden">
                  <div className="rounded-[2rem] bg-gradient-to-br from-background via-background to-muted/20 border border-border/40 overflow-hidden">
                    <div className="h-[450px] flex items-center justify-center relative overflow-hidden group">
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.03]">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
                      </div>
                      
                      <motion.div 
                         animate={{ 
                           scale: [1, 1.2, 1],
                           opacity: [0.1, 0.2, 0.1]
                         }}
                         transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                         className="absolute w-96 h-96 bg-primary/20 rounded-full blur-[100px]" 
                      />
                      
                      <div className="z-10 flex flex-col items-center gap-10 px-6">
                         <motion.div 
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative cursor-pointer"
                          >
                           <div className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-primary via-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-primary/40 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
                             <Mic className="w-16 h-16 text-white relative z-10" />
                           </div>
                           <motion.div 
                             animate={{ 
                               scale: [1, 1.5, 1],
                               opacity: [0.5, 0, 0.5]
                             }}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="absolute inset-0 rounded-[2.5rem] border-4 border-primary" 
                           />
                         </motion.div>
                         
                         <div className="space-y-5 text-center max-w-xl">
                            <motion.h4 
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 3, repeat: Infinity }}
                              className="text-2xl font-bold text-foreground"
                            >
                              Try saying...
                            </motion.h4>
                            <div className="space-y-3">
                              {[
                                '"Add task: Finish project report by Friday 5 PM"',
                                '"Remind me to call the client tomorrow morning"',
                                '"Create high priority task for team meeting"'
                              ].map((text, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.6 + i * 0.2 }}
                                  className="px-6 py-3 rounded-xl bg-muted/50 border border-border/40 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                                >
                                  {text}
                                </motion.div>
                              ))}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Features</h2>
                <h3 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Powerful & Intuitive</h3>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Everything you need to stay organized and productive</p>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                  <div className="relative p-10 rounded-3xl border-2 border-border/40 bg-card/50 backdrop-blur-sm hover:bg-card hover:border-border/60 transition-all duration-500 h-full">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">How It Works</h2>
                <h3 className="text-5xl md:text-6xl font-black tracking-tight mb-6">Simple in 3 Steps</h3>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              
              {[
                { 
                  step: '01', 
                  icon: <Mic className="w-8 h-8" />,
                  title: 'Speak Your Task', 
                  desc: 'Just say what you need to do, naturally and conversationally',
                  color: 'from-blue-500 to-cyan-500'
                },
                { 
                  step: '02', 
                  icon: <Brain className="w-8 h-8" />,
                  title: 'AI Organizes', 
                  desc: 'VoXa automatically categorizes, prioritizes, and schedules',
                  color: 'from-violet-500 to-purple-500'
                },
                { 
                  step: '03', 
                  icon: <CheckCircle className="w-8 h-8" />,
                  title: 'Get Reminded', 
                  desc: 'Smart notifications ensure you never miss a deadline',
                  color: 'from-emerald-500 to-teal-500'
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                  viewport={{ once: true }}
                  className="relative text-center group"
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mx-auto mb-6 shadow-xl relative z-10`}
                  >
                    {item.icon}
                  </motion.div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 text-8xl font-black text-muted/5 -z-10">
                    {item.step}
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                  <p className="text-muted-foreground text-lg leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-20 rounded-[3rem] bg-gradient-to-br from-foreground via-foreground to-foreground/90 text-background overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px]" />
              
              <div className="relative z-10 text-center space-y-10">
                <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                   Ready to Transform<br />Your Productivity?
                </h2>
                <p className="text-2xl text-background/70 max-w-2xl mx-auto font-medium">
                  Join thousands managing tasks effortlessly with voice commands
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleLogin} size="lg" className="h-20 px-16 rounded-2xl text-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/50">
                     Start Using VoXa Free
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="border-t border-border/40 py-20 px-6 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">VoXa</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Voice Tasks</span>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed text-lg max-w-md">
                Voice-powered task management that helps you stay organized and productive without lifting a finger.
              </p>
              <div className="flex items-center gap-3">
                 <motion.a whileHover={{ scale: 1.1, y: -2 }} href="https://github.com/portgasdyamato" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-muted border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all">
                   <Github className="w-5 h-5" />
                 </motion.a>
                 <motion.a whileHover={{ scale: 1.1, y: -2 }} href="https://www.linkedin.com/in/ethsakshi/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-muted border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all">
                   <Linkedin className="w-5 h-5" />
                 </motion.a>
                 <motion.a whileHover={{ scale: 1.1, y: -2 }} href="https://pippoportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-xl bg-muted border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all">
                   <Globe className="w-5 h-5" />
                 </motion.a>
              </div>
            </div>
            
            <div>
               <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Product</h4>
               <ul className="space-y-4 text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a></li>
                  <li><button onClick={handleLogin} className="hover:text-foreground transition-colors">Get Started</button></li>
               </ul>
            </div>
            
            <div>
               <h4 className="text-sm font-bold uppercase tracking-wider mb-6">Resources</h4>
               <ul className="space-y-4 text-muted-foreground">
                  <li><a href="https://github.com/portgasdyamato" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                  <li><a href="https://pippoportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Portfolio</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
               </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
            <p>© 2026 VoXa. Built with ❤️ for productivity.</p>
            <div className="flex gap-8">
               <a href="#" className="hover:text-foreground transition-colors">Terms</a>
               <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
