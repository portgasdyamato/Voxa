import { Button } from '@/components/ui/button';
import { Mic, ArrowRight, Zap, CheckCircle2, Star, Shield, Sparkles, Brain, Calendar, Bell, Globe, Play, ChevronRight, Quote } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import heroGif from '@/assets/hero.gif';

export default function Landing() {
  const featuresRef = useRef<HTMLDivElement>(null);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-[#030507] text-white overflow-x-hidden">
      
      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,130,246,0.06)_0%,transparent_70%)]" />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '72px 72px',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="flex items-center justify-between h-14 px-6 rounded-2xl bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_16px_40px_rgba(0,0,0,0.4)]">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/40 group-hover:scale-110 transition-transform">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-black tracking-tight">VoXa</span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-8 text-[12px] font-semibold uppercase tracking-widest text-white/40">
              <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors duration-300">How it Works</a>
              <a href="#about" className="hover:text-white transition-colors duration-300">About</a>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <button onClick={handleLogin} className="text-[12px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors px-4 py-2 hidden sm:block">
                Sign In
              </button>
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 h-9 px-5 rounded-xl bg-primary text-white text-[12px] font-black uppercase tracking-wider shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.03] active:scale-95 transition-all duration-300"
              >
                Get started <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ═══════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section className="relative pt-36 pb-24 px-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/25 text-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Voice-powered task management</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-center max-w-5xl mx-auto mb-8"
            >
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-[-0.04em] leading-[0.92]">
                <span className="text-white">Speak it</span>
                <br />
                <span
                  className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
                >
                  into existence.
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-center text-xl text-white/40 max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
            >
              The high-performance task manager that listens. Just speak — VoXa captures, organises, and schedules everything automatically.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <button
                onClick={handleLogin}
                className="group flex items-center gap-3 h-14 px-10 rounded-2xl bg-primary text-white font-black text-[14px] uppercase tracking-widest shadow-[0_8px_40px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_50px_rgba(59,130,246,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <Mic className="w-5 h-5" />
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group flex items-center gap-3 h-14 px-10 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-white font-bold text-[13px] uppercase tracking-widest hover:bg-white/[0.08] transition-all duration-300">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-white ml-0.5" />
                </div>
                Watch demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#030507] bg-gradient-to-br from-blue-500 to-violet-500 overflow-hidden shadow-md">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 7}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest">
                    <span className="text-white">1,200+</span> people trust VoXa
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-white/10" />

              <div className="flex items-center gap-6 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest flex-wrap justify-center">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card</span>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-400" /> Private & secure</span>
              </div>
            </motion.div>
          </div>

          {/* ── Hero App Preview ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto mt-20 relative"
          >
            {/* Glow behind card */}
            <div className="absolute inset-x-0 -top-8 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 via-violet-500/10 to-transparent rounded-[2.5rem] blur-2xl" />

            {/* App window */}
            <div className="relative rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/[0.08] bg-[#0a0c10] shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
              {/* Window chrome */}
              <div className="h-9 md:h-11 border-b border-white/[0.06] bg-white/[0.02] flex items-center px-4 md:px-5 gap-2">
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-rose-500/60" />
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-amber-500/60" />
                <div className="w-2 md:w-3 h-2 md:h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 md:mx-8">
                  <div className="h-5 md:h-6 rounded-md bg-white/[0.04] border border-white/[0.04] w-32 md:w-64 mx-auto flex items-center justify-center">
                    <span className="text-[7px] md:text-[9px] font-mono text-white/20 truncate">app.voxa.io/workspace</span>
                  </div>
                </div>
              </div>
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={heroGif}
                  alt="VoXa Interface"
                  className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0c10] to-transparent" />
              </div>
            </div>

            {/* ── Floating notification cards ── */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-5 -right-6 hidden lg:flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0d1117]/90 backdrop-blur-xl border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 mb-0.5">System</p>
                <p className="text-[13px] font-bold text-white leading-none">Objectives Synced</p>
              </div>
              <div className="ml-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#4ade80]" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="absolute -bottom-5 -left-6 hidden lg:flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#0d1117]/90 backdrop-blur-xl border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35 mb-0.5">Voice</p>
                <p className="text-[13px] font-bold text-white leading-none">Listening...</p>
              </div>
              <motion.div
                className="ml-2 flex gap-0.5 items-center"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                {[1,2,3,4].map(i => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full bg-primary"
                    animate={{ height: [4, 14, 4] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════
            STATS STRIPE
        ════════════════════════════════════════ */}
        <section className="py-16 px-6 border-y border-white/[0.05] bg-white/[0.01]">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
            {[
              { value: '1,200+', label: 'Active users' },
              { value: '98%', label: 'Accuracy rate' },
              { value: '<2s', label: 'Task capture' },
              { value: '5★', label: 'User rating' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center space-y-2"
              >
                <div
                  className="text-4xl md:text-5xl font-black tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.value}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURES ─ Bento Grid
        ════════════════════════════════════════ */}
        <section id="features" ref={featuresRef} className="py-32 px-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Section header */}
            <div className="text-center mb-20 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/40">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Everything you need</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-[-0.03em] text-white leading-tight">
                Built for people who<br />
                <span className="text-white/30">move fast.</span>
              </h2>
              <p className="text-lg text-white/35 max-w-xl mx-auto leading-relaxed">
                No more typing. No more friction. Just speak, and VoXa handles the rest — from capture to completion.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              
              {/* Large feature 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="md:col-span-4 group relative rounded-3xl p-8 bg-gradient-to-br from-primary/10 via-[#0d1117] to-[#0d1117] border border-white/[0.07] hover:border-primary/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mb-6">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Voice-First Capture</h3>
                <p className="text-white/40 leading-relaxed text-[15px] max-w-md">
                  Just say it. VoXa listens, understands context, and instantly creates a structured task — no tapping, no typing, no friction.
                </p>
                {/* Mini demo UI */}
                <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center gap-4">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                    <Mic className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] text-white/30 font-mono italic">"Remind me to send the report by Friday 5pm"</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-[11px] font-bold text-emerald-400">Task added ✓</p>
                  </div>
                </div>
              </motion.div>

              {/* Tall feature 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2 group relative rounded-3xl p-8 bg-gradient-to-br from-violet-500/10 via-[#0d1117] to-[#0d1117] border border-white/[0.07] hover:border-violet-400/30 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-6">
                  <Brain className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">AI Organisation</h3>
                <p className="text-white/40 leading-relaxed text-[14px]">
                  Automatically categorises, tags priority, and sorts tasks so your workspace is always clean.
                </p>
                {/* Mini tags */}
                <div className="mt-8 flex flex-wrap gap-2">
                  {['Work', 'Urgent', 'Personal', 'Later'].map((tag, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white/[0.04] border border-white/[0.08] text-white/40">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="md:col-span-2 group relative rounded-3xl p-8 bg-gradient-to-br from-cyan-500/8 via-[#0d1117] to-[#0d1117] border border-white/[0.07] hover:border-cyan-400/30 transition-all duration-500 overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">Smart Deadlines</h3>
                <p className="text-white/40 leading-relaxed text-[14px]">
                  Dates and times extracted automatically from natural speech. "Next Friday at 3pm" just works.
                </p>
                <div className="mt-6 px-4 py-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span className="text-[12px] font-bold text-cyan-400/70">Fri, Mar 7 · 15:00</span>
                </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 group relative rounded-3xl p-8 bg-gradient-to-br from-amber-500/8 via-[#0d1117] to-[#0d1117] border border-white/[0.07] hover:border-amber-400/30 transition-all duration-500 overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center mb-6">
                  <Bell className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">Smart Reminders</h3>
                <p className="text-white/40 leading-relaxed text-[14px]">
                  Never miss a deadline with intelligent notifications that adapt to how you actually work.
                </p>
              </motion.div>

              {/* Feature 5 — wide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="md:col-span-2 group relative rounded-3xl p-8 bg-gradient-to-br from-emerald-500/8 via-[#0d1117] to-[#0d1117] border border-white/[0.07] hover:border-emerald-400/30 transition-all duration-500 overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">Private by Design</h3>
                <p className="text-white/40 leading-relaxed text-[14px]">
                  End-to-end encrypted. Your voice data is yours — never sold, never shared, never stored.
                </p>
              </motion.div>

              {/* Feature 6 — analytics teaser */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="md:col-span-6 group relative rounded-3xl p-8 md:p-10 bg-gradient-to-r from-primary/8 via-[#0d1117] to-violet-500/8 border border-white/[0.07] hover:border-white/[0.12] transition-all duration-500 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3 max-w-xl">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white/50" />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">Works everywhere, syncs instantly</h3>
                    <p className="text-white/40 leading-relaxed">
                      Web, mobile, tablet — your workspace follows you. Real-time sync keeps everything up-to-date across all your devices.
                    </p>
                  </div>
                  <div className="flex gap-3 flex-shrink-0">
                    {['Web', 'iOS', 'Android'].map((p) => (
                      <div key={p} className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[12px] font-black uppercase tracking-widest text-white/30">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════ */}
        <section id="how-it-works" className="py-32 px-6 border-t border-white/[0.05]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/40">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">In three steps</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-[-0.03em] text-white leading-tight">
                Simple as<br />
                <span className="text-white/30">speaking.</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Speak your task',
                  desc: 'Open VoXa and just say what you need to do. No buttons, no forms — only your voice.',
                  color: 'text-primary',
                  border: 'border-primary/20',
                  bg: 'bg-primary/10',
                },
                {
                  step: '02',
                  title: 'AI does the rest',
                  desc: 'VoXa extracts the task, deadline, priority, and category automatically. Reviewed in seconds.',
                  color: 'text-violet-400',
                  border: 'border-violet-400/20',
                  bg: 'bg-violet-400/10',
                },
                {
                  step: '03',
                  title: 'Stay on track',
                  desc: 'Smart reminders and your performance dashboard keep you accountable and moving forward.',
                  color: 'text-emerald-400',
                  border: 'border-emerald-400/20',
                  bg: 'bg-emerald-400/10',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group rounded-3xl p-8 bg-[#0d1117] border border-white/[0.07] hover:border-white/[0.12] transition-all duration-500"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.border} border flex items-center justify-center mb-6`}>
                    <span className={`text-sm font-black ${item.color}`}>{item.step}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-3 tracking-tight">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed text-[14px]">{item.desc}</p>
                  {/* Connector line on desktop */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-[3.5rem] -right-3 w-6 h-px bg-gradient-to-r from-white/20 to-transparent z-10" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            QUOTE / HIGHLIGHT
        ════════════════════════════════════════ */}
        <section className="py-24 px-6 border-t border-white/[0.05]">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl p-10 md:p-16 bg-gradient-to-br from-primary/10 via-[#0d1117] to-violet-500/10 border border-white/[0.08] relative overflow-hidden"
            >
              <div className="absolute top-8 left-8 opacity-10">
                <Quote className="w-24 h-24 text-primary" />
              </div>
              <div className="relative z-10 space-y-8">
                <p className="text-2xl md:text-3xl font-bold text-white/80 leading-relaxed italic">
                  "Remind me to finalize the project report by Friday at 5 PM, high priority."
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Task', value: 'Finalize project report', color: 'text-primary bg-primary/10 border-primary/20' },
                    { label: 'Due', value: 'Fri · 17:00', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
                    { label: 'Priority', value: 'High', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
                  ].map((tag) => (
                    <span key={tag.label} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-wider border ${tag.color}`}>
                      <span className="opacity-50">{tag.label}:</span> {tag.value}
                    </span>
                  ))}
                </div>
                <p className="text-white/30 text-sm font-medium">VoXa extracts all of this automatically — in under a second.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FINAL CTA
        ════════════════════════════════════════ */}
        <section className="py-32 px-6 border-t border-white/[0.05] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/40">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Get started today — it's free</span>
              </div>
              <h2 className="text-6xl md:text-7xl font-black tracking-[-0.04em] text-white leading-[0.9]">
                Your most<br />
                <span className="text-white/25">productive self</span><br />
                starts here.
              </h2>
              <p className="text-lg text-white/35 max-w-xl mx-auto leading-relaxed">
                Join thousands of people who use VoXa to stay on top of everything — without the stress.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                onClick={handleLogin}
                className="group flex items-center gap-3 h-14 px-12 rounded-2xl bg-primary text-white font-black text-[14px] uppercase tracking-widest shadow-[0_8px_40px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_60px_rgba(59,130,246,0.6)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
              >
                Launch VoXa
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer id="about" className="border-t border-white/[0.05] py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-black tracking-tight">VoXa</span>
              <span className="text-white/20 text-sm font-medium ml-2">© 2026</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-white/25">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-widest text-white/25">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
