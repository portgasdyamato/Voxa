import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useCreateTask } from '@/hooks/useTasks';
import { detectPriority } from '@/lib/priorityDetection';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, X } from 'lucide-react';

interface VoiceTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceTaskModal({ open, onOpenChange }: VoiceTaskModalProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const { toast } = useToast();
  
  const {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: false,
  });

  const createTask = useCreateTask();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  useEffect(() => {
    if (transcript && !isListening) {
      setShowTranscription(true);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleStartRecording = () => {
    resetTranscript();
    setShowTranscription(false);
    startListening();
  };

  const handleSaveTask = async () => {
    if (!transcript.trim()) {
      toast({
        title: "Error",
        description: "No transcript available to save",
        variant: "destructive",
      });
      return;
    }

    const priority = detectPriority(transcript);
    
    try {
      await createTask.mutateAsync({
        title: transcript.slice(0, 100), // Limit title length
        description: transcript.length > 100 ? transcript.slice(100) : undefined,
        priority,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Due tomorrow
      });

      toast({
        title: "Task Created",
        description: `Task "${transcript.slice(0, 50)}..." has been created with ${priority} priority`,
      });

      onOpenChange(false);
      resetTranscript();
      setShowTranscription(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    stopListening();
    onOpenChange(false);
    resetTranscript();
    setShowTranscription(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-pink-100 text-pink-800';
      case 'medium':
        return 'bg-purple-100 text-purple-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Voice Task Input</DialogTitle>
        <DialogDescription className="sr-only">
          Create a new task using voice recognition
        </DialogDescription>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Mic className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Voice Task Input</h3>
            <p className="text-gray-600 text-sm mt-1">Speak your task clearly...</p>
          </div>

          {!showTranscription ? (
            <div className="space-y-3">
              {isListening ? (
                <>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse-recording"></div>
                    <span className="text-sm font-medium text-gray-700">Recording...</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <span>{formatTime(recordingTime)}</span>
                  </div>
                  <Button
                    onClick={stopListening}
                    variant="outline"
                    className="w-full"
                  >
                    Stop Recording
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleStartRecording}
                  className="w-full gradient-primary text-white hover:opacity-90"
                >
                  Start Recording
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-left">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h4>
                <p className="text-sm text-gray-800">{transcript}</p>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Detected Priority:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  getPriorityColor(detectPriority(transcript))
                }`}>
                  {detectPriority(transcript).charAt(0).toUpperCase() + detectPriority(transcript).slice(1)}
                </span>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleSaveTask}
                  disabled={createTask.isPending}
                  className="flex-1 gradient-primary text-white hover:opacity-90"
                >
                  {createTask.isPending ? 'Saving...' : 'Save Task'}
                </Button>
                <Button
                  onClick={handleStartRecording}
                  variant="outline"
                  className="flex-1"
                >
                  Re-record
                </Button>
              </div>
            </div>
          )}

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
