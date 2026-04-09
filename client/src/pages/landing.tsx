import { 
  ArrowRight, Sparkles, Database, ArrowUp, ArrowUpRight, 
  LayoutGrid, Layers, History, RefreshCw, Box, 
  Bot, Workflow, ShieldCheck, Zap
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValue } from 'framer-motion';
import { useRef, useEffect } from 'react';
import heroGif from '@/assets/hero.gif';
import processGif from '@/assets/process.gif';

/* ─── HLS Video Hook ────────────────────────────────── */
function useHlsVideo(src: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => { video && video.play().catch(() => {}); };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', tryPlay);
      return () => video.removeEventListener('loadedmetadata', tryPlay);
    } else {
      import('hls.js').then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: false });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
          return () => hls.destroy();
        }
      });
    }
  }, [src]);
  return videoRef;
}

/* ─── Premium Interactive Bento Card ─────────────────── */
function BentoCard({ title, icon: Icon, span = "col-span-1", children, delay = 0 }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1200 }}
      className={`${span} relative h-full`}
    >
      <motion.div
        whileHover={{ scale: 1.015 }}
        style={{ rotateX, rotateY }}
        className="relative h-full rounded-[2.8rem] border border-white/[0.22] bg-white/[0.1] backdrop-blur-[40px] overflow-hidden transition-all duration-500 group flex flex-col will-change-transform shadow-[0_45px_100px_-25px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.2)]"
      >
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
        <motion.div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30"
          style={{ background: useTransform([mouseX, mouseY], ([mx, my]) => `radial-gradient(450px circle at ${mx}px ${my}px, rgba(59,130,246,0.18), transparent 80%)`) }}
        />

        <div className="p-8 pb-2 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.1] border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-500 shadow-inner">
              <Icon className="w-5.5 h-5.5 text-white/40 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-500" />
            </div>
            <h4 className="text-[20px] font-bold tracking-tight text-white/95 group-hover:text-white transition-colors">{title}</h4>
          </div>
        </div>
        
        <div className="px-8 pb-8 flex-1 relative z-10 flex flex-col">
          {children}
        </div>
        <div className="absolute -bottom-20 -right-20 w-52 h-52 bg-blue-500/[0.08] blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Ultra High-Fidelity Interactive Assets ─── */

const NeuralCylindricalCore = () => (
  <div className="relative w-full h-[140px] rounded-[2rem] bg-black/30 border border-white/5 overflow-hidden group-hover:border-blue-500/20 transition-all shadow-inner my-4">
    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/5 opacity-50" />
    <div className="flex items-end justify-center gap-2.5 h-full px-12 pb-5">
       {[0, 1, 2, 3, 4, 3, 2, 1, 0].map((hIndex, i) => (
         <div key={`col-v6-${i}`} className="flex flex-col gap-1.5 flex-1 items-center">
            {Array.from({length: 6}).map((_, dotIndex) => (
              <motion.div 
                key={`dot-v6-${i}-${dotIndex}`}
                animate={{ 
                  opacity: dotIndex < hIndex + 1 ? [0.3, 1, 0.3] : [0.05, 0.1, 0.05],
                  scale: dotIndex < hIndex + 1 ? [0.9, 1.15, 0.9] : [1, 1, 1]
                }}
                transition={{ 
                  duration: 2.2, 
                  repeat: Infinity, 
                  repeatType: "loop",
                  delay: (i * 0.1) + (dotIndex * 0.1),
                  ease: "easeInOut"
                }}
                className={`w-full aspect-square rounded-full shadow-[0_0_8px_rgba(59,130,246,0.2)] ${dotIndex < hIndex + 1 ? 'bg-blue-400' : 'bg-white/10'}`}
                style={{ maxWidth: '6px' }}
              />
            ))}
         </div>
       ))}
    </div>
  </div>
);

const OrbitalMeshSystem = () => (
  <div className="relative w-full h-[150px] flex items-center justify-center py-4">
     <div className="relative w-28 h-28">
        {[0, 1, 2].map((i) => (
           <motion.div 
             key={`orb-v6-${i}`}
             animate={{ rotate: i % 2 === 0 ? [0, 360] : [0, -360] }}
             transition={{ duration: 15 + (i * 5), repeat: Infinity, ease: "linear", repeatType: "loop" }}
             className="absolute inset-0 rounded-full border border-dashed border-blue-500/10"
             style={{ padding: `${i * 12}px` }}
           >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_#60a5fa30]" />
           </motion.div>
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-12 h-12 rounded-full bg-blue-500/5 border border-blue-500/20 flex items-center justify-center backdrop-blur-3xl shadow-[0_0_40px_rgba(59,130,246,0.1)]">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
           </div>
        </div>
     </div>
  </div>
);

const FractalPrismShield = () => (
  <div className="relative w-full h-[150px] flex items-center justify-center p-4">
     <div className="grid grid-cols-4 gap-2.5 w-36">
        {Array.from({length: 12}).map((_, i) => (
           <motion.div 
             key={`prizm-v6-${i}`}
             animate={{ 
               opacity: [0.1, 0.5, 0.1],
               scale: [0.95, 1, 0.95]
             }}
             transition={{ duration: 3, repeat: Infinity, delay: i * 0.1, repeatType: "loop" }}
             className="aspect-square rounded-xl border border-white/5 bg-blue-500/5 backdrop-blur-sm group-hover:border-blue-500/20 transition-colors"
           />
        ))}
     </div>
  </div>
);

const HyperFastDataStreams = () => (
   <div className="relative w-full h-[140px] bg-black/20 border border-white/5 rounded-3xl overflow-hidden my-4 group-hover:border-blue-400/10 transition-all">
      <div className="flex justify-around items-end h-full px-12 pb-2">
         {Array.from({length: 8}).map((_, i) => (
            <div key={`strm-v6-${i}`} className="relative w-2 h-full bg-white/[0.01]">
               <motion.div 
                 animate={{ y: ['100%', '-100%'], opacity: [0, 1, 0] }}
                 transition={{ 
                   duration: 1.2 + (i * 0.25), 
                   repeat: Infinity, 
                   ease: "linear",
                   repeatType: "loop"
                 }}
                 className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-blue-400/40 to-transparent shadow-[0_0_20px_#60a5fa15]"
               />
            </div>
         ))}
      </div>
   </div>
);

const RadarScan = () => (
  <div className="relative w-full h-[130px] flex items-center justify-center">
    <div className="w-28 h-28 rounded-full border border-white/10 flex items-center justify-center relative bg-black/20 shadow-inner overflow-hidden">
       <motion.div 
         animate={{ rotate: [0, 360] }}
         transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatType: "loop" }}
         className="absolute inset-0 bg-gradient-to-r from-blue-400/40 to-transparent origin-center rounded-full"
         style={{ clipPath: 'conic-gradient(from 0deg, white, transparent)' }}
       />
       <div className="absolute inset-2 border border-blue-500/10 rounded-full opacity-30" />
       <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_20px_#60a5fa] relative z-10" />
    </div>
  </div>
);

/* ─── Scrolling Marquee ──────────────────── */
const PhilosophicalMarquee = () => (
   <div className="relative w-full overflow-hidden py-40 border-y border-white/[0.08] bg-[#020202]">
      <div className="absolute inset-0 bg-blue-500/[0.02] blur-3xl pointer-events-none" />
      <motion.div 
        animate={{ x: [0, -2800] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-40 items-center relative z-10"
      >
        {Array.from({length: 8}).map((_, i) => (
          <div key={`mrq-v2-${i}`} className="flex items-center gap-40">
            <span className="text-[13px] font-black tracking-[1.2em] text-white/35 uppercase select-none">Absolute Precision</span>
            <Sparkles className="w-4 h-4 text-white/10" />
            <span className="text-[13px] font-black tracking-[1.2em] text-white/35 uppercase select-none">Vocal Intelligence</span>
            <RefreshCw className="w-4 h-4 text-white/10" />
            <span className="text-[13px] font-black tracking-[1.2em] text-white/35 uppercase select-none">Native Encryption</span>
            <Workflow className="w-4 h-4 text-white/10" />
            <span className="text-[13px] font-black tracking-[1.2em] text-white/35 uppercase select-none">Orchestrated Flow</span>
            <Bot className="w-4 h-4 text-white/10" />
          </div>
        ))}
      </motion.div>
      <div className="absolute inset-y-0 left-0 w-80 bg-gradient-to-r from-[#010101] via-[#010101]/80 to-transparent z-20" />
      <div className="absolute inset-y-0 right-0 w-80 bg-gradient-to-l from-[#010101] via-[#010101]/80 to-transparent z-20" />
   </div>
);

export default function Landing() {
  const handleLogin = () => { window.location.href = '/api/login'; };
  const videoRef = useHlsVideo('https://stream.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU.m3u8');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ offset: ["start start", "end end"] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  
  const videoY = useTransform(smoothProgress, [0, 1], ["0%", "15%"]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.1], [1, 0]);

  return (
    <div className="relative bg-[#010101] text-[#f1f1f1] font-sans selection:bg-white/20 overflow-x-hidden min-h-screen">
      <div ref={containerRef} className="relative w-full h-full">
        
        {/* ── Background Video ── */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <motion.video
            ref={videoRef} autoPlay muted loop playsInline
            style={{ y: videoY }}
            className="w-full h-full object-cover scale-[1.05]"
          />
          <div className="absolute inset-0 bg-[#010101]/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/80 via-transparent to-transparent" />
        </div>

        {/* ── HEADER ── */}
        <header className="fixed top-0 left-0 right-0 z-[100] p-6 md:p-10 pointer-events-none">
          <div className="max-w-[1800px] mx-auto flex items-center justify-between">
               <div className="flex items-center gap-5 group cursor-pointer pointer-events-auto" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_20px_white]" />
                  <span className="text-[22px] font-black tracking-[0.2em] text-white/95 uppercase">VoXa</span>
               </div>

               <nav className="hidden lg:flex items-center gap-8 px-10 py-5 rounded-full border border-white/20 bg-white/[0.04] backdrop-blur-3xl shadow-2xl pointer-events-auto relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-px bg-white/30 rounded-full" />
                  {[
                    { icon: Zap, target: 'hero' },
                    { icon: Box, target: 'features' },
                    { icon: ArrowRight, target: 'cta' }
                  ].map((item, i) => (
                    <div 
                      key={`nav-ic-v4-${i}`} 
                      onClick={() => {
                        const target = document.getElementById(item.target);
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group/nav relative flex items-center justify-center p-2 cursor-pointer z-20"
                    >
                      <item.icon className="w-6 h-6 text-white/40 group-hover/nav:text-white group-hover/nav:scale-110 transition-all duration-300" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-white group-hover/nav:w-4 transition-all duration-300" />
                    </div>
                  ))}
               </nav>
          </div>
        </header>

        {/* ── Hero ── */}
        <motion.section 
          id="hero"
          style={{ opacity: heroOpacity }}
          className="relative z-10 w-full h-screen flex flex-col justify-center pt-24 pb-12 px-6 md:px-16 2xl:px-24 max-w-[1800px] mx-auto overflow-hidden"
        >
          <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}>
              <h1 className="text-[4rem] sm:text-[4.5rem] xl:text-[5.5rem] font-bold leading-[0.88] tracking-[-0.05em] text-white mb-8">
                The architecture <br /> 
                <span className="font-serif italic font-light text-white/70">of absolute</span> <br /> 
                vocal intelligence.
              </h1>
              <p className="text-[18px] text-white/30 mb-8 max-w-lg font-light tracking-wide italic leading-relaxed">"The VoXa protocol refines every spoken word into its most crystalline form."</p>
              
              <button 
                onClick={handleLogin} 
                className="group relative px-10 py-5 rounded-full transition-all hover:scale-[1.03] active:scale-95 shadow-[0_30px_100px_rgba(0,0,0,0.6)] bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-[40px] border border-white/20 overflow-hidden"
              >
                 <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
                 <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
                 <span className="text-[14px] font-medium tracking-tight text-white relative z-20">Start Your VoXa Journey</span>
              </button>
            </motion.div>

            <div className="flex flex-col gap-6 scale-[0.85] xl:scale-[0.9] origin-center lg:origin-right">
               <div className="p-8 md:p-10 rounded-[3rem] border border-white/[0.25] bg-white/[0.12] backdrop-blur-[40px] shadow-[0_60px_120px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.25)] relative overflow-hidden group">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
                  <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                  <div className="flex items-center gap-5 mb-6 text-white/90">
                     <div className="w-12 h-12 rounded-2xl bg-white/[0.12] flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-blue-500/10 transition-all duration-500"><Sparkles className="w-5 h-5 text-white/60" /></div>
                     <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/60">VoXa Intelligence</span>
                  </div>
                  <p className="text-[17px] text-white/50 leading-relaxed font-light tracking-wide max-w-sm">VoXa seamlessly converts natural voice commands into high-fidelity structured intelligence.</p>
               </div>

               <div className="flex gap-6">
                 {[ {gif: heroGif, label: 'Listening', node: 'LISTEN'}, {gif: processGif, label: 'Transcribing', node: 'TRANSCRIBE'} ]
                  .map((n, i) => (
                   <div key={`hero-ns-v7-${i}`} className="flex-1 p-6 rounded-[2.8rem] border border-white/[0.25] bg-white/[0.12] backdrop-blur-[40px] group flex flex-col items-center relative overflow-hidden shadow-[0_45px_100px_-15px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.25)]">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
                      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                      <div className="aspect-square w-full rounded-[2.2rem] overflow-hidden bg-black/40 border border-white/10 mb-5 relative shadow-inner">
                         <img src={n.gif} className="w-full h-full object-cover opacity-70 mix-blend-screen scale-110 group-hover:scale-120 transition-all duration-[2s]" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center pb-5">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">{n.label}</span>
                         </div>
                      </div>
                      <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">Status: Operating</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Features ── */}
        <section id="features" className="relative z-10 px-6 md:px-16 2xl:px-24 pb-60 max-w-[1800px] mx-auto">
          <h2 className="text-[4rem] sm:text-[5rem] lg:text-[6.5rem] font-bold leading-[1] text-white tracking-[-0.05em] mb-24 max-w-5xl">
             VoXa: Exploring the boundary of <br /> <span className="font-serif italic font-light opacity-[0.4] pr-4">orchestrated voice.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <BentoCard title="Voice Intelligence" icon={Bot} span="md:col-span-2">
              <p className="text-[17px] text-white/40 leading-relaxed font-light mb-8 max-w-lg">Advanced voice processing that understands your context and intent with perfect accuracy.</p>
              <NeuralCylindricalCore />
            </BentoCard>

            <BentoCard title="Real-time Sync" icon={RefreshCw}>
              <p className="text-[14px] text-white/20 leading-relaxed font-light mb-auto italic">Keep your data synchronized across all devices instantly and securely.</p>
              <OrbitalMeshSystem />
            </BentoCard>

            <BentoCard title="Data Security" icon={ShieldCheck}>
              <p className="text-[14px] text-white/20 leading-relaxed font-light mb-auto italic">Bank-grade encryption that keeps your personal voice recordings safe and private.</p>
              <FractalPrismShield />
            </BentoCard>

            <BentoCard title="Smart Multitasking" icon={Workflow} span="lg:col-span-2">
              <div className="flex flex-col gap-8 h-full">
                 <HyperFastDataStreams />
                 <p className="text-[17px] text-white/40 leading-relaxed font-light max-w-2xl">Handle multiple tasks and voice commands at once without missing a beat, powered by the VoXa processing engine.</p>
              </div>
            </BentoCard>

            <BentoCard title="Secure History" icon={Database}>
               <div className="space-y-3 pt-8">
                  {[1,2,3].map(i => (
                    <div key={`archv-v7-${i}`} className="group/item flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] border border-white/5 hover:bg-white/10 hover:border-blue-500/20 transition-all cursor-pointer">
                       <Box className="w-4 h-4 text-white/20 group-hover/item:text-blue-400 transition-colors" />
                       <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-blue-500/20" /></div>
                    </div>
                  ))}
               </div>
            </BentoCard>

            <BentoCard title="Instant Cloud" icon={RefreshCw}>
              <div className="flex-1 flex flex-col items-center justify-center pt-6"><RadarScan /></div>
            </BentoCard>
          </div>
        </section>

        {/* ── CTA ── */}
        <section id="cta" className="relative z-10 px-6 md:px-16 2xl:px-24 mb-32">
            <div className="max-w-[1200px] mx-auto">
               <div className="relative rounded-[4rem] border border-white/[0.3] bg-white/[0.08] backdrop-blur-3xl p-16 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 overflow-hidden shadow-[0_80px_160px_-20px_rgba(0,0,0,1),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-20" />
                  <div 
                     className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                  />
                  {/* Decorative Glow */}
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 flex-1 max-w-2xl">
                    <h2 className="text-[3.5rem] md:text-[5rem] font-bold text-white tracking-[-0.05em] leading-[0.9] mb-8">
                       Evolve your <br /> <span className="font-serif italic font-light text-white/70">vocal workflow.</span>
                    </h2>
                    <p className="text-[18px] text-white/40 leading-relaxed font-light tracking-wide max-w-md">
                       Step into a world where your voice is the only interface you need. Absolute precision, infinite possibilities.
                    </p>
                  </div>
                  
                  <div className="relative z-10">
                    <button onClick={handleLogin} className="group relative px-16 py-8 rounded-full border border-white/20 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-[40px] text-white text-[15px] font-medium tracking-tight transition-all hover:scale-105 active:scale-95 shadow-2xl overflow-hidden">
                       <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
                       <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
                       <span className="relative z-20 flex items-center gap-3">
                          Launch VoXa Portal
                          <ArrowRight className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                       </span>
                    </button>
                  </div>

                  <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-500/5 blur-[100px] pointer-events-none" />
               </div>
            </div>
        </section>

        {/* ── Marquee Transition ── */}
        <section className="relative z-10">
           <PhilosophicalMarquee />
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-20 px-6 md:px-16 2xl:px-24 pb-20 pt-32 overflow-hidden">
            <div className="max-w-[1800px] mx-auto relative z-10 space-y-24">
               <div className="flex flex-col lg:flex-row items-start justify-between gap-20">
                  <div className="p-10 rounded-[3rem] border border-white/[0.25] bg-white/[0.08] backdrop-blur-[40px] shadow-[0_45px_100px_rgba(0,0,0,0.6)] relative overflow-hidden group max-w-md">
                     <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent z-20" />
                     <div className="flex items-center gap-5 mb-8">
                        <div className="w-10 h-10 rounded-2xl bg-white/[0.1] border border-white/10 flex items-center justify-center shadow-inner group-hover:bg-blue-500/20 transition-all duration-500"><Sparkles className="w-5 h-5 text-white/50" /></div>
                        <span className="text-[18px] font-black uppercase tracking-[0.4em] text-white/90">VoXa</span>
                     </div>
                     <p className="text-[15px] text-white/40 leading-relaxed font-light mb-8">Designing the future of human-voice interaction with absolute precision and simple, intuitive design.</p>
                     <div className="flex items-center gap-4 py-2 px-4 rounded-full bg-white/[0.05] border border-white/10 w-fit">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/40">Status: Active</span>
                     </div>
                  </div>

                  <div className="flex flex-wrap gap-10 lg:gap-24 flex-1 justify-end">
                     {[
                       { label: 'Platform', links: ['Capabilities', 'Ecosystem', 'History'] },
                       { label: 'Security', links: ['Privacy', 'Archive', 'Protection'] },
                       { label: 'Network', links: ['X-Twitter', 'Support', 'Legal'] }
                     ].map((group, idx) => (
                       <div key={`f-gl-v3-${idx}`} className="space-y-10 min-w-[140px]">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">{group.label}</h5>
                          <ul className="space-y-5">
                             {group.links.map((link, lIdx) => (
                               <li key={`f-li-v3-${idx}-${lIdx}`}>
                                  <a href="#" className="group/link text-[15px] text-white/30 hover:text-white transition-all duration-300 relative inline-block">
                                     {link}
                                     <div className="absolute -bottom-1 left-0 w-0 h-px bg-blue-500/50 group-hover/link:w-full transition-all duration-500" />
                                  </a>
                               </li>
                             ))}
                          </ul>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-16 relative z-20">
                  {/* Subtle centered line replacement for full-width border */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  
                  <div className="flex gap-10 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
                     <span>Privacy Policy</span>
                     <span>Terms of Service</span>
                     <span>© 2026 VoXa</span>
                  </div>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="group relative px-6 py-6 rounded-full bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-[40px] border border-white/20 flex items-center justify-center hover:bg-white/[0.1] transition-all shadow-xl overflow-hidden">
                     <div className="absolute inset-x-0 top-0 h-px bg-white/40 rounded-full" />
                     <ArrowUp className="w-6 h-6 text-white/50 group-hover:text-white transition-all duration-500 group-hover:-translate-y-1" />
                  </button>
               </div>
            </div>

            {/* Massive Background Text - Moved to Bottom for Structural Grounding */}
            <motion.div 
               style={{ y: useTransform(smoothProgress, [0.9, 1], [0, -120]) }}
               className="absolute -bottom-20 left-0 right-0 text-center pointer-events-none select-none z-0"
            >
               <h2 className="text-[16vw] font-serif italic font-light text-white/[0.03] leading-none tracking-tight">VOXA</h2>
            </motion.div>
        </footer>
      </div>
    </div>
  );
}
