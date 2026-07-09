import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, Plus, FileText, Pin, MoreVertical, Search, 
  Trash2, FileEdit, Tag, Mic, Sparkles, FileText as FileTextIcon, ListTodo, Undo, Redo, PanelLeft, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Eye, Edit3
} from 'lucide-react';
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { AudioExtension } from '@/lib/AudioExtension';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle } from '@tiptap/extension-text-style';
import ImageResize from 'tiptap-extension-resize-image';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import TextAlign from '@tiptap/extension-text-align';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drag and drop state
  const [draggedNoteId, setDraggedNoteId] = useState<number | null>(null);

  // Dialog states
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  
  // Rename state
  const [renameNoteId, setRenameNoteId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Delete state
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  // Preview state
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const dictationRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { data: notes = [] as any[] } = useQuery({ queryKey: ['/api/notes'] });
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

  const reorderNotesMutation = useMutation({
    mutationFn: async (updates: any[]) => {
      await apiRequest('PATCH', '/api/notes/reorder', { updates });
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
  const handleAIAction = async (action: 'summarize' | 'polish' | 'task') => {
    if (!editor || !selectedNoteId) return;
    setIsProcessingAI(true);
    toast({ title: `Processing ${action}...`, description: "Applying AI format to your note." });
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
      toast({ title: "AI Error", description: "Failed to process your request.", variant: "destructive" });
    }
    setIsProcessingAI(false);
  };

  const selectedNote = (notes as any[]).find((n: any) => n.id === selectedNoteId);

  const handleCreateNote = () => {
    createNoteMutation.mutate({
      title: 'Untitled Note',
      content: '',
      isPinned: false
    });
    setIsPreviewMode(false);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedNoteId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetNoteId: number) => {
    e.preventDefault();
    if (draggedNoteId === null || draggedNoteId === targetNoteId) return;

    const currentNotes = [...notes];
    const draggedIndex = currentNotes.findIndex((n: any) => n.id === draggedNoteId);
    const targetIndex = currentNotes.findIndex((n: any) => n.id === targetNoteId);
    
    const [removed] = currentNotes.splice(draggedIndex, 1);
    currentNotes.splice(targetIndex, 0, removed);
    
    // Update order property
    const updates = currentNotes.map((n, index) => ({ id: n.id, order: index }));
    
    // Optimistic update
    queryClient.setQueryData(['/api/notes'], currentNotes);
    
    // Call reorder API
    reorderNotesMutation.mutate(updates);
    setDraggedNoteId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (editor && reader.result) {
          editor.chain().focus().setImage({ src: reader.result as string }).run();
          setIsImageDialogOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const submitImageUrl = () => {
    if (imageUrlInput && editor) {
      editor.chain().focus().setImage({ src: imageUrlInput }).run();
      setIsImageDialogOpen(false);
      setImageUrlInput('');
    }
  };

  const editor = useEditor({
    extensions: [
      GlobalDragHandle.configure({
        dragHandleWidth: 20,
        scrollTreshold: 100,
      }),
      StarterKit,
      AudioExtension,
      ImageResize.configure({
        inline: true,
        allowBase64: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image', 'audio'],
      }),
      TextStyle,
      FontFamily,
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

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreviewMode);
    }
  }, [isPreviewMode, editor]);

  return (
    <div className="flex h-[calc(100vh-128px)] min-h-[400px] overflow-hidden rounded-[2.5rem] bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in duration-700">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-white/10 bg-white/[0.02] flex flex-col overflow-hidden shrink-0"
          >
            <div className="p-6 pb-4 w-80">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                    className="text-white/40 hover:text-white hover:bg-white/10 -ml-2"
                    title="Collapse Sidebar"
                  >
                    <PanelLeft className="w-5 h-5" />
                  </Button>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Notes
                  </h1>
                </div>
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

        <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar">
          {(notes as any[])
            .filter((n: any) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((note: any) => (
            <motion.div
              key={note.id}
              draggable
              onDragStart={(e: any) => handleDragStart(e, note.id)}
              onDragOver={handleDragOver}
              onDrop={(e: any) => handleDrop(e, note.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedNoteId(note.id);
                setIsPreviewMode(true);
              }}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                selectedNoteId === note.id 
                  ? 'bg-white/10 border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                  : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                {renameNoteId === note.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => {
                      if (renameValue.trim() !== '') {
                        updateNoteMutation.mutate({ id: note.id, updates: { title: renameValue } });
                      }
                      setRenameNoteId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (renameValue.trim() !== '') {
                          updateNoteMutation.mutate({ id: note.id, updates: { title: renameValue } });
                        }
                        setRenameNoteId(null);
                      }
                    }}
                    className="h-6 text-sm bg-black/40 border-white/20 text-white px-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className="text-white font-medium truncate">{note.title || 'Untitled Note'}</h3>
                )}
                
                <div className="flex items-center gap-1 shrink-0">
                  {note.isPinned && <Pin className="w-3 h-3 text-blue-400" />}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10 text-white/40 hover:text-white">
                        <MoreVertical className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 bg-[#121214] border-white/10 text-white">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameNoteId(note.id);
                          setRenameValue(note.title);
                        }}
                        className="hover:bg-white/10 cursor-pointer"
                      >
                        <FileEdit className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          const isCurrentlyPinned = note.isPinned;
                          updateNoteMutation.mutate({ id: note.id, updates: { isPinned: !isCurrentlyPinned } });
                          toast({
                            title: !isCurrentlyPinned ? "Note pinned" : "Note unpinned",
                            description: !isCurrentlyPinned ? "This note will appear at the top." : "Note removed from pins.",
                          });
                        }}
                        className="hover:bg-white/10 cursor-pointer"
                      >
                        <Pin className="w-4 h-4 mr-2" /> {note.isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          setNoteToDelete(note.id);
                        }}
                        className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-white/40 text-xs line-clamp-2">
                {note.content ? note.content.replace(/<[^>]+>/g, '') : 'No additional text'}
              </p>
            </motion.div>
          ))}
        </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-black/20">
        {selectedNoteId ? (
          <>
            <div className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-transparent sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {!isSidebarOpen && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-white/40 hover:text-white hover:bg-white/10 -ml-4"
                    title="Expand Sidebar"
                  >
                    <PanelLeft className="w-5 h-5" />
                  </Button>
                )}
                <input
                  type="text"
                  value={selectedNote?.title || ''}
                  onChange={(e) => updateNoteMutation.mutate({ id: selectedNoteId, updates: { title: e.target.value }})}
                  className="bg-transparent border-none text-2xl font-semibold text-white focus:outline-none focus:ring-0 p-0 placeholder:text-white/20"
                  placeholder="Note Title"
                  readOnly={isPreviewMode}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={isPreviewMode ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`gap-2 ${isPreviewMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                  title={isPreviewMode ? "Switch to Edit Mode" : "Switch to Preview Mode"}
                >
                  {isPreviewMode ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {isPreviewMode ? "Edit Note" : "Preview Note"}
                </Button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    const isCurrentlyPinned = selectedNote?.isPinned;
                    updateNoteMutation.mutate({ id: selectedNoteId, updates: { isPinned: !isCurrentlyPinned }});
                    toast({
                      title: !isCurrentlyPinned ? "Note pinned" : "Note unpinned",
                      description: !isCurrentlyPinned ? "This note will appear at the top." : "Note removed from pins.",
                    });
                  }}
                  className={`hover:bg-white/10 text-white/40 hover:text-white ${selectedNote?.isPinned ? 'text-blue-400 hover:text-blue-300' : ''}`}
                >
                  <Pin className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setNoteToDelete(selectedNoteId);
                  }}
                  className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            
            <div className={`flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar p-8 max-w-4xl mx-auto w-full prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-blue-400 break-words whitespace-pre-wrap ${isPreviewMode ? 'preview-mode' : ''}`}>
              
              {!isPreviewMode && (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/5 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImageDialogOpen(true)}
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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (isDictating) {
                      dictationRef.current?.stop();
                      setIsDictating(false);
                    } else {
                      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                      if (!SR) {
                        toast({ title: "Not Supported", description: "Speech recognition is not supported in this browser." });
                        return;
                      }
                      
                      const rec = new SR();
                      rec.continuous = true;
                      rec.interimResults = true;
                      dictationRef.current = rec;
                      
                      let finalTranscript = '';
                      
                      rec.onstart = () => setIsDictating(true);
                      
                      rec.onresult = (event: any) => {
                        let interim = '';
                        for (let i = event.resultIndex; i < event.results.length; ++i) {
                          if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript + ' ';
                          } else {
                            interim += event.results[i][0].transcript;
                          }
                        }
                      };
                      
                      rec.onend = async () => {
                        setIsDictating(false);
                        if (finalTranscript.trim()) {
                           toast({ title: "Formatting...", description: "AI is formatting your dictation..." });
                           try {
                             const res = await fetch('/api/ai/dictate', {
                               method: 'POST',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ rawText: finalTranscript })
                             });
                             const data = await res.json();
                             if (data.html && editor) {
                               editor.chain().focus().insertContent(data.html + '<p></p>').run();
                               toast({ title: "Dictation Inserted" });
                             }
                           } catch (err) {
                             toast({ title: "Dictation Failed", description: err.message, variant: "destructive" });
                           }
                        }
                      };
                      
                      rec.start();
                    }
                  }}
                  className={`border-white/10 text-white hover:bg-white/10 ${isDictating ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 'bg-white/5'}`}
                >
                  <Mic className={`w-4 h-4 mr-2 ${isDictating ? 'animate-pulse text-blue-400' : ''}`} />
                  {isDictating ? 'Stop Dictating' : 'Smart Dictate'}
                </Button>

                <div className="w-px h-6 bg-white/10 mx-2" />

                {/* Formatting Buttons */}
                <Select 
                  onValueChange={(value) => editor?.chain().focus().setFontFamily(value).run()}
                >
                  <SelectTrigger className="w-[120px] h-8 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Font" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-white/10 text-white">
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="monospace">Monospace</SelectItem>
                    <SelectItem value="Comic Sans MS, Comic Sans">Comic Sans</SelectItem>
                  </SelectContent>
                </Select>

                <Select 
                  onValueChange={(value) => {
                    if (value === 'p') editor?.chain().focus().setParagraph().run();
                    else editor?.chain().focus().toggleHeading({ level: parseInt(value) as any }).run();
                  }}
                >
                  <SelectTrigger className="w-[120px] h-8 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#121214] border-white/10 text-white">
                    <SelectItem value="p">Paragraph</SelectItem>
                    <SelectItem value="1">Heading 1</SelectItem>
                    <SelectItem value="2">Heading 2</SelectItem>
                    <SelectItem value="3">Heading 3</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editor?.chain().focus().toggleTaskList().run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive('taskList') ? 'bg-white/20' : ''}`}
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  Checklist
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive('bulletList') ? 'bg-white/20' : ''}`}
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive('orderedList') ? 'bg-white/20' : ''}`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </Button>

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

                <div className="w-px h-6 bg-white/10 mx-1" />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-white/20' : ''}`}
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-white/20' : ''}`}
                  title="Align Center"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                  className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-white/20' : ''}`}
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-white/10 mx-2" />
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().undo().run()}
                  disabled={!editor?.can().chain().focus().undo().run()}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 w-8"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => editor?.chain().focus().redo().run()}
                  disabled={!editor?.can().chain().focus().redo().run()}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-8 w-8"
                >
                  <Redo className="w-4 h-4" />
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
                  onClick={() => handleAIAction('task')}
                  disabled={isProcessingAI}
                  className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                >
                  <ListTodo className="w-4 h-4 mr-2" />
                  AI: Extract Tasks
                </Button>
              </div>
              </>
              )}

              <EditorContent editor={editor} className="min-h-[500px]" />
              
              <style>{`
                .ProseMirror {
                  outline: none;
                  min-height: calc(100vh - 400px);
                  padding-bottom: 4rem;
                }
                .preview-mode .ProseMirror {
                  min-height: auto;
                  padding-bottom: 2rem;
                }
                .preview-mode .drag-handle {
                  display: none !important;
                }
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
                .ProseMirror ul[data-type="taskList"] {
                  list-style: none;
                  padding: 0;
                }
                .ProseMirror ul[data-type="taskList"] li {
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 0.25rem;
                }
                .ProseMirror ul[data-type="taskList"] li > label {
                  margin-right: 0.5rem;
                  margin-top: 0.1rem;
                  user-select: none;
                  display: flex;
                  align-items: center;
                }
                .ProseMirror ul[data-type="taskList"] li > label input {
                  margin: 0;
                  cursor: pointer;
                }
                .ProseMirror ul[data-type="taskList"] li > div {
                  flex: 1;
                }
                .ProseMirror ul[data-type="taskList"] li p {
                  margin: 0;
                  line-height: 1.6;
                }
                
                /* Drag and drop styling */
                .drag-handle {
                  cursor: grab;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 24px;
                  height: 24px;
                  border-radius: 4px;
                  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>');
                  background-repeat: no-repeat;
                  background-position: center;
                  color: rgba(255, 255, 255, 0.4);
                  transition: background-color 0.2s, color 0.2s, opacity 0.2s;
                }
                .drag-handle.hide {
                  opacity: 0;
                  pointer-events: none;
                }
                .drag-handle:hover {
                  background-color: rgba(255, 255, 255, 0.1);
                  color: rgba(255, 255, 255, 0.8);
                }
                .ProseMirror-selectednode img {
                  outline: 2px solid rgba(59, 130, 246, 0.5); /* blue-500 */
                  border-radius: 0.5rem;
                  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                  transition: all 0.2s ease;
                }
                .ProseMirror-selectednode audio {
                  opacity: 0.8;
                }
              `}</style>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20 relative">
            {!isSidebarOpen && (
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="absolute top-6 left-6 text-white/40 hover:text-white hover:bg-white/10"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </Button>
            )}
            <FileEdit className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one to start writing.</p>
          </div>
        )}
      </div>

      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="bg-[#121214] border border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="image-url">Image URL</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-white/5 border-white/10 text-white"
                  onKeyDown={(e) => e.key === 'Enter' && submitImageUrl()}
                />
                <Button onClick={submitImageUrl} className="bg-blue-600 hover:bg-blue-700">Add</Button>
              </div>
            </div>
            
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-white/40 text-xs">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="image-upload">Upload from computer</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="bg-white/5 border-white/10 text-white file:text-white file:bg-white/10 file:border-0 file:rounded-md hover:file:bg-white/20 cursor-pointer"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={noteToDelete !== null} onOpenChange={(open) => !open && setNoteToDelete(null)}>
        <DialogContent className="bg-[#0c0c0e] border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-white/60">Are you sure you want to delete this note? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNoteToDelete(null)} className="text-white/60 hover:text-white">Cancel</Button>
            <Button onClick={() => {
              if (noteToDelete !== null) {
                deleteNoteMutation.mutate(noteToDelete);
              }
              setNoteToDelete(null);
            }} className="bg-red-600 hover:bg-red-700 text-white border-0">Delete Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
