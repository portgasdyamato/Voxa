import { Button } from '@/components/ui/button';
import { Mic, Zap, ArrowRight, Play, CheckCircle, Shield, Clock, Github, Twitter, Linkedin, Globe, Calendar, ListTodo } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-white" />,
      title: 'Voice-First Task Creation',
      description: 'Simply speak your tasks naturally. VoXa understands context and automatically organizes everything for you.',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: <ListTodo className="w-8 h-8 text-white" />,
      title: 'Smart Organization',
      description: 'Automatically categorize tasks, set priorities, and get intelligent reminders based on your deadlines.',
      color: 'from-violet-600 to-purple-600',
    },
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      title: 'Deadline Management',
      description: 'Never miss a deadline. Get timely notifications and see your tasks organized by priority and due date.',
      color: 'from-amber-600 to-orange-600',
    },
    {
      icon: <Shield className="w-8 h-8 text-white" />,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. We take your privacy seriously with industry-standard protection.',
      color: 'from-emerald-600 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl px-6">
        <div className="max-w-7xl mx-auto flex h-20 items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Zap className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight">VoXa</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Button 
               onClick={handleLogin}
               className="h-10 rounded-xl px-6 font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 text-center">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-xs font-semibold text-primary mb-8"
            >
              <Mic className="h-3.5 w-3.5" />
              Voice-Powered Task Management
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6"
            >
              Manage Your Tasks <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-indigo-400">With Your Voice</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed mb-12"
            >
              Stop typing. Start speaking. VoXa helps you capture, organize, and complete your tasks using natural voice commands.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="h-14 px-10 rounded-xl text-base font-semibold" onClick={handleLogin}>
                Start Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl text-base font-semibold">
                <Play className="mr-2 w-4 h-4" /> Watch Demo
              </Button>
            </motion.div>

            {/* App Preview */}
            <motion.div 
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative mt-24 w-full max-w-5xl mx-auto"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full opacity-30" />
              <div className="relative rounded-3xl border border-border/40 bg-card/60 p-4 shadow-2xl backdrop-blur-xl overflow-hidden">
                <div className="h-[500px] w-full rounded-2xl bg-background border border-border/40 flex items-center justify-center relative overflow-hidden">
                    <motion.div 
                       animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
                       transition={{ duration: 6, repeat: Infinity }}
                       className="absolute w-full h-full bg-primary/5 rounded-full blur-[80px]" 
                    />
                    <div className="z-10 flex flex-col items-center gap-8">
                       <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className="w-32 h-32 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 cursor-pointer"
                        >
                         <Mic className="w-14 h-14 text-white" />
                       </motion.div>
                       <div className="space-y-4 text-center">
                          <h4 className="text-2xl font-bold text-foreground">Try saying...</h4>
                          <p className="text-lg text-muted-foreground max-w-md">"Add a task to finish the project report by Friday at 5 PM"</p>
                       </div>
                    </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 px-6 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Features</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Everything You Need</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group p-8 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:bg-background transition-all hover:shadow-lg"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-105 transition-transform`}>
                    {feature.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">How It Works</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight">Simple & Intuitive</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: '1', title: 'Speak Your Task', desc: 'Just say what you need to do naturally' },
                { step: '2', title: 'Auto-Organized', desc: 'VoXa categorizes and prioritizes for you' },
                { step: '3', title: 'Get Reminded', desc: 'Never miss a deadline with smart notifications' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-6">
                    {item.step}
                  </div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-16 rounded-3xl bg-foreground text-background overflow-hidden text-center"
            >
              <div className="absolute inset-0 bg-primary/10 blur-[100px]" />
              
              <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                   Ready to Get Organized?
                </h2>
                <p className="text-xl text-background/70 max-w-2xl mx-auto">
                  Join thousands of users who manage their tasks effortlessly with VoXa.
                </p>
                <Button onClick={handleLogin} size="lg" className="h-16 px-12 rounded-2xl text-lg font-semibold bg-primary text-white hover:bg-primary/90 shadow-xl">
                   Start Using VoXa Free
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="about" className="border-t border-border/40 py-16 px-6 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">VoXa</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Voice-powered task management that helps you stay organized and productive.
              </p>
              <div className="flex items-center gap-3">
                 <a href="https://github.com/portgasdyamato" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all">
                   <Github className="w-4 h-4" />
                 </a>
                 <a href="https://www.linkedin.com/in/ethsakshi/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all">
                   <Linkedin className="w-4 h-4" />
                 </a>
                 <a href="https://pippoportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-muted border border-border/40 flex items-center justify-center hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all">
                   <Globe className="w-4 h-4" />
                 </a>
              </div>
            </div>
            
            <div>
               <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Product</h4>
               <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                  <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a></li>
                  <li><a href={handleLogin} className="hover:text-foreground transition-colors cursor-pointer">Get Started</a></li>
               </ul>
            </div>
            
            <div>
               <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Resources</h4>
               <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><a href="https://github.com/portgasdyamato" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
                  <li><a href="https://pippoportfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Developer Portfolio</a></li>
                  <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
               </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 VoXa. Built with ❤️ for productivity.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-foreground transition-colors">Terms</a>
               <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
