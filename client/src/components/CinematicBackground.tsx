import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

function useHlsVideo(src: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const tryPlay = () => { video && video.play().catch(() => {}); };
    
    // Check if HLS is supported natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', tryPlay);
    } 
    // Otherwise use hls.js (already should be available globally or imported if needed)
    else if ((window as any).Hls) {
      const Hls = (window as any).Hls;
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, tryPlay);
    }
  }, [src]);
  return videoRef;
}

export function CinematicBackground() {
  const videoRef = useHlsVideo('https://stream.mux.com/r6pXRAJb3005XEEbl1hYU1x01RFJDSn7KQApwNGgAHHbU.m3u8');
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25 });
  const videoY = useTransform(smoothProgress, [0, 1], ["0%", "15%"]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <motion.video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        style={{ y: videoY }}
        className="w-full h-full object-cover scale-[1.05]"
      />
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 bg-[#010101]/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#010101]/80 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#010101]/40" />
      
      {/* Optional Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    </div>
  );
}
