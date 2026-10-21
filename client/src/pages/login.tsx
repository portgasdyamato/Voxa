import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Zap, Sparkles, ArrowLeft, Mic, ShieldCheck, CheckCircle2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    const msg = params.get("message");
    if (err || msg) {
      setErrorMessage(msg || (err === "oauth_error" ? "Google Authentication was cancelled or failed." : "Authentication failed."));
    }
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleDemoLogin = () => {
    setIsDemoLoading(true);
    const demoUser = {
      email: "demo@voxa.app",
      firstName: "Demo",
      lastName: "User",
      isAuthenticated: true,
    };
    localStorage.setItem("voxa_authenticated", "true");
    localStorage.setItem("voxa_user", JSON.stringify(demoUser));
    
    // Redirect cleanly to home
    setTimeout(() => {
      window.location.href = "/home";
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-[#010101] text-[#f1f1f1] font-sans selection:bg-white/20 overflow-hidden flex flex-col justify-between">
      {/* Background ambient glowing spheres */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px]" />
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
          }} 
        />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full p-6 md:p-10 flex items-center justify-between max-w-7xl mx-auto">
        <div 
          onClick={() => setLocation("/")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_white] transition-transform group-hover:scale-125" />
          <span className="text-[18px] md:text-[20px] font-black tracking-[0.2em] text-white uppercase">VoXa</span>
        </div>

        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl text-white/70 hover:text-white text-xs font-medium tracking-wide transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing</span>
        </button>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md p-8 md:p-10 rounded-[2.5rem] border border-white/[0.15] bg-[#0c0d12]/80 backdrop-blur-[50px] shadow-[0_45px_120px_-20px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.2)] relative overflow-hidden"
        >
          {/* Subtle top edge highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Icon Badge */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-[1.75rem] bg-white/[0.06] border border-white/10 flex items-center justify-center shadow-inner relative group">
              <div className="absolute inset-0 rounded-[1.75rem] bg-blue-500/10 blur-xl group-hover:blur-2xl transition-all" />
              <Zap className="w-7 h-7 text-white fill-white relative z-10" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Enter VoXa
            </h1>
            <p className="text-xs md:text-sm text-white/40 font-light leading-relaxed">
              Your voice-powered workspace for crystalline clarity.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3.5">
            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full group relative flex items-center justify-center gap-3.5 px-6 py-4 rounded-2xl border border-white/20 bg-white/[0.07] hover:bg-white/[0.12] active:scale-[0.98] backdrop-blur-2xl text-white font-medium text-sm transition-all shadow-xl"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <FcGoogle className="w-5 h-5 flex-shrink-0" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="w-full h-px bg-white/10" />
              <span className="absolute px-3 bg-[#0c0d12] text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">
                OR
              </span>
            </div>

            {/* Demo / Guest Login */}
            <button
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
              className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 active:scale-[0.98] backdrop-blur-2xl text-blue-200 hover:text-white font-medium text-sm transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-blue-400 group-hover:rotate-12 transition-transform" />
              <span>{isDemoLoading ? "Activating Session..." : "Instant Demo Access"}</span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-[11px] text-white/40">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-blue-400/80 shrink-0" />
              <span>Full Voice Control</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />
              <span>Secure Session</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
              <span>Tasks & Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span>AI Dictation</span>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-[11px] text-white/20 tracking-wider">
        VOXA INTELLIGENCE &bull; ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
