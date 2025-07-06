import { useState, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useCreateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { detectPriority } from '@/lib/priorityDetection';
import { detectDateFromText, formatRelativeDate } from '@/lib/dateDetection';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReminderSettings } from '@/components/ReminderSettings';
import { Mic, X, Tag, Calendar, Clock } from 'lucide-react';

interface VoiceTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceTaskModal({ open, onOpenChange }: VoiceTaskModalProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDeadline, setSelectedDeadline] = useState<Date | null>(null);
  const [deadlineInputValue, setDeadlineInputValue] = useState('');
  const [detectedDate, setDetectedDate] = useState<Date | null>(null);
  
  // Reminder settings state
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderType, setReminderType] = useState<'manual' | 'morning' | 'default'>('default');
  const [reminderTime, setReminderTime] = useState<string>('');
  
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
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
      
      // Detect date from transcript
      const dateResult = detectDateFromText(transcript);
      if (dateResult.detectedDate && dateResult.confidence === 'high') {
        setDetectedDate(dateResult.detectedDate);
        setSelectedDeadline(dateResult.detectedDate);
        setDeadlineInputValue(dateResult.detectedDate.toISOString().split('T')[0]);
      } else {
        setDetectedDate(null);
      }
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
    setSelectedCategory('');
    setSelectedDeadline(null);
    setDetectedDate(null);
    setDeadlineInputValue('');
    setReminderEnabled(true);
    setReminderType('default');
    setReminderTime('');
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
        categoryId: selectedCategory && selectedCategory !== 'none' ? parseInt(selectedCategory) : undefined,
        dueDate: selectedDeadline ? selectedDeadline.toISOString() : undefined,
        reminderEnabled,
        reminderType,
        reminderTime: reminderType === 'manual' ? reminderTime : undefined,
      });

      const deadlineText = selectedDeadline ? ` (due ${formatRelativeDate(selectedDeadline)})` : '';
      const reminderText = reminderEnabled ? 
        reminderType === 'manual' ? ` with reminder at ${reminderTime}` :
        reminderType === 'morning' ? ' with morning reminder' :
        ' with default reminder' : '';
      
      toast({
        title: "Task Created",
        description: `Task "${transcript.slice(0, 50)}..." has been created with ${priority} priority${deadlineText}${reminderText}`,
      });

      onOpenChange(false);
      resetTranscript();
      setShowTranscription(false);
      setSelectedCategory('');
      setSelectedDeadline(null);
      setDetectedDate(null);
      setDeadlineInputValue('');
      setReminderEnabled(true);
      setReminderType('default');
      setReminderTime('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeadlineChange = (value: string) => {
    setDeadlineInputValue(value);
    if (value) {
      const date = new Date(value);
      date.setHours(23, 59, 59, 999); // Set to end of day
      setSelectedDeadline(date);
    } else {
      setSelectedDeadline(null);
    }
  };

  const handleClose = () => {
    stopListening();
    onOpenChange(false);
    resetTranscript();
    setShowTranscription(false);
    setSelectedCategory('');
    setSelectedDeadline(null);
    setDetectedDate(null);
    setDeadlineInputValue('');
    setReminderEnabled(true);
    setReminderType('default');
    setReminderTime('');
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
              
              <div className="space-y-2">
                <Label htmlFor="category-select" className="text-sm font-medium text-gray-700 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  Category (Optional)
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-select" className="w-full">
                    <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline-input" className="text-sm font-medium text-gray-700 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline (Optional)
                </Label>
                {detectedDate && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                    <Clock className="w-4 h-4" />
                    <span>Detected: {formatRelativeDate(detectedDate)}</span>
                  </div>
                )}
                <Input
                  id="deadline-input"
                  type="date"
                  value={deadlineInputValue}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
                {selectedDeadline && (
                  <p className="text-xs text-gray-500">
                    Due: {formatRelativeDate(selectedDeadline)}
                  </p>
                )}
              </div>
              
              {/* Reminder Settings */}
              {selectedDeadline && (
                <ReminderSettings
                  reminderEnabled={reminderEnabled}
                  reminderType={reminderType}
                  reminderTime={reminderTime}
                  onReminderEnabledChange={setReminderEnabled}
                  onReminderTypeChange={setReminderType}
                  onReminderTimeChange={setReminderTime}
                />
              )}
              
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
