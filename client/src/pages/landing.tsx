import { Button } from '@/components/ui/button';
import { Mic, ArrowRight, Sparkles, Zap, CheckCircle2, Star, Music2, Volume2, Radio, AlignJustify } from 'lucide-react';
import { motion, useMotionValue, useSpring, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const springConfig = { damping: 25, stiffness: 100 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Liquid Morphing Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(138, 43, 226, 0.25) 0%, transparent 70%)',
            filter: 'blur(80px)',
            x: useTransform(cursorXSpring, (x) => x - 400),
            y: useTransform(cursorYSpring, (y) => y - 400),
          }}
        />
        
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(255, 51, 102, 0.2) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -150, 0],
            y: [0, 150, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full" 
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-3 rounded-2xl">
                <Radio className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter">VoXa</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">Voice Engine</span>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleLogin}
              className="relative overflow-hidden bg-white text-black font-bold px-8 py-6 rounded-full hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
            >
              <span className="relative z-10">Launch App</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
                style={{ opacity: 0.1 }}
              />
            </Button>
          </motion.div>
        </div>
      </motion.nav>

      {/* Hero Section - Magazine Layout */}
      <section className="relative min-h-screen flex items-center px-6 pt-32 pb-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6 backdrop-blur-xl">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">Powered by AI</span>
                </div>

                <h1 className="text-7xl lg:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.9] mb-6">
                  <span className="block">Your</span>
                  <span className="block relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                      Voice,
                    </span>
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-2xl -z-10"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </span>
                  <span className="block">Your Rules</span>
                </h1>

                <p className="text-xl lg:text-2xl text-gray-400 leading-relaxed max-w-2xl font-light">
                  Speak naturally. Get organized effortlessly. VoXa transforms your voice into 
                  <span className="text-white font-medium"> actionable tasks </span> 
                  with zero friction.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleLogin}
                    className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-10 py-7 rounded-full shadow-2xl shadow-purple-500/25"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Speaking
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 2, opacity: 0.1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="border-2 border-gray-700 hover:border-gray-600 bg-transparent hover:bg-gray-900/50 text-white font-bold text-lg px-10 py-7 rounded-full backdrop-blur-xl"
                  >
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex gap-8 pt-8"
              >
                {[
                  { value: '10x', label: 'Faster' },
                  { value: '99%', label: 'Accurate' },
                  { value: '0', label: 'Learning Curve' },
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Interactive Voice Visual */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="relative"
              >
                {/* Main Circle */}
                <div className="relative w-full aspect-square max-w-md mx-auto">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-1"
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div className="w-full h-full rounded-full bg-[#0a0a0f] flex items-center justify-center">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-50"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 p-12 rounded-full cursor-pointer">
                          <Mic className="w-16 h-16 text-white" />
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Orbiting Icons */}
                  {[
                    { icon: Volume2, delay: 0, color: 'from-purple-500 to-purple-600' },
                    { icon: Music2, delay: 0.33, color: 'from-pink-500 to-pink-600' },
                    { icon: Radio, delay: 0.66, color: 'from-cyan-500 to-cyan-600' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={i}
                        className={`absolute w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-2xl`}
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [
                            Math.cos(item.delay * 2 * Math.PI) * 180,
                            Math.cos((item.delay + 1) * 2 * Math.PI) * 180,
                          ],
                          y: [
                            Math.sin(item.delay * 2 * Math.PI) * 180,
                            Math.sin((item.delay + 1) * 2 * Math.PI) * 180,
                          ],
                        }}
                        transition={{
                          duration: 10,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section className="relative px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-6xl lg:text-7xl font-black tracking-tighter mb-6">
              Built for
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Speed & Simplicity
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Every feature designed to save you time and mental energy
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Large Feature */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 lg:row-span-2 relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <div className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-10 border border-gray-800 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6">
                      <Mic className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-black mb-4">Voice-First Creation</h3>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                      Just speak naturally. No typing, no complex UIs. VoXa understands context, 
                      deadlines, and priorities from your voice alone.
                    </p>
                  </div>

                  <div className="mt-12 space-y-3">
                    {[
                      'Natural language processing',
                      'Context-aware task creation',
                      'Automatic deadline extraction',
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 text-gray-300"
                      >
                        <CheckCircle2 className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Animated Waveform */}
                <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end gap-1 px-10 pb-10 opacity-20">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-full"
                      animate={{
                        height: [
                          `${20 + Math.random() * 60}%`,
                          `${20 + Math.random() * 60}%`,
                        ],
                      }}
                      transition={{
                        duration: 0.5 + Math.random(),
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Small Feature Cards */}
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Create tasks in seconds, not minutes',
                color: 'from-yellow-500 to-orange-500',
                delay: 0.1,
              },
              {
                icon: Star,
                title: 'Smart Priority',
                description: 'AI detects urgency automatically',
                color: 'from-blue-500 to-cyan-500',
                delay: 0.2,
              },
              {
                icon: AlignJustify,
                title: 'Auto-Organize',
                description: 'Categories created intelligently',
                color: 'from-green-500 to-emerald-500',
                delay: 0.3,
              },
              {
                icon: CheckCircle2,
                title: 'Never Forget',
                description: 'Smart reminders that adapt',
                color: 'from-purple-500 to-pink-500',
                delay: 0.4,
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: feature.delay }}
                  whileHover={{ y: -8 }}
                  className="relative group"
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-3xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                  <div className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-800 hover:border-gray-700 transition-all">
                    <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-6`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-32">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[3rem] p-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 animate-gradient" 
              style={{ backgroundSize: '200% 200%' }}
            />
            
            <div className="relative bg-[#0a0a0f] rounded-[2.9rem] p-16 lg:p-24 text-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl"
              />

              <div className="relative z-10">
                <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight">
                  Stop Typing.
                  <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    Start Speaking.
                  </span>
                </h2>
                <p className="text-xl lg:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                  Join thousands who've transformed their productivity with the power of voice
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleLogin}
                    className="relative group overflow-hidden bg-white text-black hover:bg-gray-100 font-black text-xl px-12 py-8 rounded-full shadow-2xl shadow-white/20"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Get Started Free
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-16 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 p-3 rounded-2xl">
                  <Radio className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter">VoXa</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-purple-400">Voice Engine</span>
              </div>
            </div>

            <div className="text-gray-500 text-sm">
              © 2026 VoXa. Built with passion for productivity.
            </div>

            <div className="flex gap-6">
              {['GitHub', 'LinkedIn', 'Portfolio'].map((link, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors font-medium"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
