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
    <div ref={containerRef} className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">VoXa</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleLogin} className="text-sm font-medium hidden sm:flex">Log In</Button>
            <Button onClick={handleLogin} className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20">Get Started</Button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">Intelligent Task Management</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Speak it into <br />
                <span className="text-primary">Existence.</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Transform your voice into actionable tasks instantly. VoXa combines advanced voice recognition with AI to keep you organized without ever touching a keyboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" onClick={handleLogin} className="h-14 px-10 rounded-full text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-full text-lg font-bold border-2">
                  View Demo
                </Button>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User avatar" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium">
                   <div className="flex text-amber-500 mb-0.5">
                     {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                   </div>
                   <p className="text-muted-foreground"><span className="text-foreground font-bold">500+</span> happy users</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card shadow-2xl">
                <div className="h-10 border-b border-border/50 bg-muted/30 flex items-center px-4 gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30" />
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                </div>
                <div className="aspect-[16/10] bg-muted/10">
                  <img 
                    src={heroGif} 
                    alt="VoXa Interface Demo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse" />
            </motion.div>
          </div>
        </section>

        {/* Logos / Social Proof */}
        <section className="py-12 border-y border-border/40 bg-muted/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-8">Trusted by productivity enthusiasts everywhere</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
               <span className="text-2xl font-black tracking-tight italic">PRODUCTIVE</span>
               <span className="text-2xl font-black tracking-tight uppercase">Workflow</span>
               <span className="text-2xl font-black tracking-tight lowcase">taskify</span>
               <span className="text-2xl font-black tracking-tight">FocusUp</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Core Mechanics</h2>
              <h3 className="text-4xl md:text-5xl font-black tracking-tight">Everything you need to master your time.</h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We've combined the power of voice with intelligent task management to create the ultimate productivity tool.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-2xl border border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed italic">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Highlight */}
        <section className="py-20 px-6">
           <div className="max-w-7xl mx-auto">
              <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 md:p-16 flex flex-col md:grid md:grid-cols-2 gap-12 items-center">
                 <div className="space-y-6">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight">"Remind me to finish the financial report by Friday morning"</h3>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      VoXa instantly understands the <span className="text-primary font-bold">Action</span> (finish report), the <span className="text-primary font-bold">Context</span> (financial), and the <span className="text-primary font-bold">Deadline</span> (Friday morning).
                    </p>
                    <div className="flex gap-3">
                       <CheckCircle2 className="w-6 h-6 text-primary" />
                       <span className="font-semibold text-primary">No manual entry required.</span>
                    </div>
                 </div>
                 <div className="relative w-full max-w-md ml-auto">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10" />
                    <div className="bg-background border border-border/50 rounded-2xl p-6 shadow-2xl space-y-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                             <Mic className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                             <p className="font-bold">Listening...</p>
                             <div className="flex gap-1 mt-1">
                                {[1,2,3,4,5].map(i => (
                                  <motion.div 
                                    key={i} 
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                    className="w-1 bg-primary rounded-full" 
                                  />
                                ))}
                             </div>
                          </div>
                       </div>
                       <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <p className="text-sm font-medium italic opacity-60">Success! Task created:</p>
                          <p className="font-bold mt-1">Finish financial report</p>
                          <div className="flex items-center gap-2 mt-2 text-primary">
                             <Calendar className="w-4 h-4" />
                             <span className="text-xs font-bold">Friday, 9:00 AM</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Ready to automate your <br />
              <span className="text-primary">productivity?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Join hundreds of high-achievers who use VoXa to manage their daily objectives with the power of their voice.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button size="lg" onClick={handleLogin} className="h-16 px-12 rounded-full text-xl font-black shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all">
                Start Using VoXa
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer id="about" className="pt-20 pb-10 px-6 border-t border-border/40 bg-muted/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
                  <Zap className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight">VoXa</span>
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed font-medium">
                The world's most intuitive voice-powered task management platform. Simple, smart, and designed for focus.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/40">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">How it Works</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/40">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-10 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-muted-foreground font-medium">© 2026 VoXa. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-muted-foreground font-medium">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
