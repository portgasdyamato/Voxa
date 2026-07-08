import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, Plus, FileText, Pin, MoreVertical, Search, 
  Trash2, FileEdit, Tag, Mic, Sparkles, FileText as FileTextIcon, ListTodo
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { AudioExtension } from '@/lib/AudioExtension';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';
import { Sparkles, FileText as FileTextIcon, ListTodo } from 'lucide-react';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { data: notes = [] } = useQuery({ queryKey: ['/api/notes'] });
  const { data: folders = [] } = useQuery({ queryKey: ['/api/folders'] });

  const createNoteMutation = useMutation({
    mutationFn: async (newNote: any) => {
      const res = await apiRequest('POST', '/api/notes', newNote);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/notes'], (old: any) => [data, ...(old || [])]);
      setSelectedNoteId(data.id);
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      await apiRequest('PATCH', `/api/notes/${id}`, updates);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/notes'] })
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/notes/${id}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      if (selectedNoteId === deletedId) setSelectedNoteId(null);
    }
  });

  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const handleAIAction = async (action: 'summarize' | 'polish') => {
    if (!editor || !selectedNoteId) return;
    setIsProcessingAI(true);
    try {
      const res = await apiRequest('POST', '/api/ai/format', {
        content: editor.getHTML(),
        action
      });
      const data = await res.json();
      editor.commands.setContent(data.content);
      updateNoteMutation.mutate({
        id: selectedNoteId,
        updates: { content: data.content }
      });
    } catch (e) {
      console.error("AI processing failed", e);
    }
    setIsProcessingAI(false);
  };

  const selectedNote = notes.find((n: any) => n.id === selectedNoteId);

  const handleCreateNote = () => {
    createNoteMutation.mutate({
      title: 'Untitled Note',
      content: '',
      isPinned: false
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      AudioExtension,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: 'Start typing your thoughts...',
      }),
    ],
    content: selectedNote?.content || '',
    onUpdate: ({ editor }) => {
      if (selectedNoteId) {
        updateNoteMutation.mutate({
          id: selectedNoteId,
          updates: { content: editor.getHTML() }
        });
      }
    },
  }, [selectedNoteId]); // Recreate editor when selected note changes

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#010101] animate-in fade-in duration-700">
      
      {/* Sidebar */}
      <div className="w-80 border-r border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex flex-col">
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Notes
            </h1>
            <Button 
              onClick={handleCreateNote}
              size="icon" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search notes..." 
              className="pl-9 bg-white/5 border-white/10 text-white rounded-xl focus:border-white/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {notes
            .filter((n: any) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((note: any) => (
            <motion.div
              key={note.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedNoteId(note.id)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                selectedNoteId === note.id 
                  ? 'bg-blue-500/10 border-blue-500/30' 
                  : 'bg-white/5 border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-white font-medium truncate">{note.title || 'Untitled Note'}</h3>
                {note.isPinned && <Pin className="w-3 h-3 text-blue-400 shrink-0" />}
              </div>
              <p className="text-white/40 text-xs line-clamp-2">
                {note.content ? note.content.replace(/<[^>]+>/g, '') : 'No additional text'}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col relative bg-[#050505]">
        {selectedNoteId ? (
          <>
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]/30 backdrop-blur-sm sticky top-0 z-10">
              <input
                type="text"
                value={selectedNote?.title || ''}
                onChange={(e) => updateNoteMutation.mutate({ id: selectedNoteId, updates: { title: e.target.value }})}
                className="bg-transparent border-none text-2xl font-semibold text-white focus:outline-none focus:ring-0 p-0 placeholder:text-white/20"
                placeholder="Note Title"
              />
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => updateNoteMutation.mutate({ id: selectedNoteId, updates: { isPinned: !selectedNote?.isPinned }})}
                  className={`text-white/40 hover:text-white ${selectedNote?.isPinned ? 'text-blue-400 hover:text-blue-300' : ''}`}
                >
                  <Pin className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (confirm('Delete this note?')) deleteNoteMutation.mutate(selectedNoteId);
                  }}
                  className="text-white/40 hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-blue-400">
              
              {/* Toolbar */}
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.prompt('URL of the image:');
                    if (url && editor) {
                      editor.chain().focus().setImage({ src: url }).run();
                    }
                  }}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Image
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (isRecording) {
                      mediaRecorderRef.current?.stop();
                      setIsRecording(false);
                    } else {
                      try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        mediaRecorderRef.current = new MediaRecorder(stream);
                        audioChunksRef.current = [];

                        mediaRecorderRef.current.ondataavailable = (e) => {
                          if (e.data.size > 0) audioChunksRef.current.push(e.data);
                        };

                        mediaRecorderRef.current.onstop = () => {
                          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                          const reader = new FileReader();
                          reader.readAsDataURL(audioBlob);
                          reader.onloadend = () => {
                            const base64Audio = reader.result as string;
                            if (editor) {
                              // @ts-ignore
                              editor.chain().focus().setAudio({ src: base64Audio }).run();
                            }
                          };
                          stream.getTracks().forEach(track => track.stop());
                        };

                        mediaRecorderRef.current.start();
                        setIsRecording(true);
                      } catch (err) {
                        console.error('Error accessing microphone', err);
                      }
                    }
                  }}
                  className={`border-white/10 text-white hover:bg-white/10 ${isRecording ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-white/5'}`}
                >
                  <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'animate-pulse text-red-500' : ''}`} />
                  {isRecording ? 'Stop Rec' : 'Voice Memo'}
                </Button>

                <div className="w-px h-6 bg-white/10 mx-2" />

                {/* Formatting Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive('bold') ? 'bg-white/20' : ''}`}
                >
                  Bold
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive('italic') ? 'bg-white/20' : ''}`}
                >
                  Italic
                </Button>

                <div className="w-px h-6 bg-white/10 mx-2" />
                
                {/* AI Tools */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('summarize')}
                  disabled={isProcessingAI}
                  className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  Summarize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('polish')}
                  disabled={isProcessingAI}
                  className="bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Polish
                </Button>

                <div className="flex-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const taskTitle = window.prompt("Task Title:", selectedNote?.title || "New Task from Note");
                    if (taskTitle) {
                      try {
                        await apiRequest('POST', '/api/tasks', {
                          title: taskTitle,
                          completed: false,
                          priority: 'medium'
                        });
                        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
                        alert('Task created successfully!');
                      } catch (e) {
                        console.error("Failed to create task", e);
                      }
                    }
                  }}
                  className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  Convert to Task
                </Button>
              </div>

              <EditorContent editor={editor} className="min-h-[500px]" />
              
              <style>{`
                .ProseMirror:focus { outline: none; }
                .ProseMirror p.is-editor-empty:first-child::before {
                  content: attr(data-placeholder);
                  float: left;
                  color: rgba(255,255,255,0.2);
                  pointer-events: none;
                  height: 0;
                }
                .ProseMirror img {
                  border-radius: 0.5rem;
                  max-width: 100%;
                  height: auto;
                  margin: 1rem 0;
                }
              `}</style>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <FileEdit className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
