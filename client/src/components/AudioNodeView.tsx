import { NodeViewWrapper } from '@tiptap/react';
import { Trash2, Play, Pause, GripVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function AudioNodeView({ node, deleteNode }: any) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = time;
      setProgress(Number(e.target.value));
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <NodeViewWrapper 
      className="audio-node-view relative my-4 block"
      style={{ textAlign: node.attrs.textAlign || 'left' }}
    >
      <div
        className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#1A1A1A] p-2 pr-4 overflow-hidden shadow-lg select-none"
        style={{ resize: 'horizontal', minWidth: '320px', maxWidth: '100%', width: '320px', transform: 'translateZ(0)' }}
      >
        <div data-drag-handle className="cursor-grab text-white/20 hover:text-white/60 pl-1 -mr-1 flex items-center justify-center shrink-0">
          <GripVertical className="w-4 h-4" />
        </div>

        <audio ref={audioRef} src={node.attrs.src} className="hidden" />
        
        <button 
          onClick={togglePlay}
          className="w-10 h-10 shrink-0 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
        </button>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
          <span>Voice Memo</span>
          <span>{formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}</span>
        </div>
        <input 
          type="range" 
          min="0" max="100" 
          value={progress} 
          onChange={handleSeek}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:rounded-full"
        />
      </div>

      <div className="w-px h-8 bg-white/10 mx-1 shrink-0" />

      <button 
        onClick={deleteNode} 
        className="p-2 shrink-0 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
        title="Delete Voice Memo"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      </div>
    </NodeViewWrapper>
  );
}
