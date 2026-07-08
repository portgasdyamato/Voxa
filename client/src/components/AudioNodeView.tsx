import { NodeViewWrapper } from '@tiptap/react';
import { Trash2 } from 'lucide-react';

export default function AudioNodeView({ node, deleteNode }: any) {
  return (
    <NodeViewWrapper className="audio-node-view relative my-4 rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
      <audio controls src={node.attrs.src} className="flex-1 min-w-[200px]" />
      <button 
        onClick={deleteNode} 
        className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
        title="Delete Voice Memo"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </NodeViewWrapper>
  );
}
