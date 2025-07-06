import { useState, useEffect } from 'react';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { VoiceCommandsHelp } from '@/components/VoiceCommandsHelp';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, MessageSquare, Keyboard } from 'lucide-react';
import { Task } from '@/types/task';

interface VoiceCommandButtonProps {
  tasks: Task[];
  className?: string;
}

export function VoiceCommandButton({ tasks, className }: VoiceCommandButtonProps) {
  const {
    isListening,
    transcript,
    lastCommand,
    startListening,
    stopListening,
    isSupported
  } = useVoiceCommands(tasks);
  
  const [showLastCommand, setShowLastCommand] = useState(false);

  // Keyboard shortcut (Ctrl/Cmd + K) to activate voice commands
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (isSupported) {
          handleClick();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isListening, isSupported]);

  if (!isSupported) {
    return null; // Don't render if speech recognition is not supported
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setShowLastCommand(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative">
        <Button
          onClick={handleClick}
          size="lg"
          className={`
            h-14 w-14 rounded-full transition-all duration-300 
            ${isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${className}
          `}
        >
          {isListening ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </Button>
        
        {isListening && (
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Status text */}
      <div className="text-center max-w-xs">
        {isListening ? (
          <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
            🎤 Listening for commands...
          </p>
        ) : null}
      </div>

      {/* Last command display */}
      {lastCommand && (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLastCommand(!showLastCommand)}
            className="text-xs"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Last Command
          </Button>
        </div>
      )}

      {/* Command details */}
      {showLastCommand && lastCommand && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-w-sm text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700 dark:text-gray-300">Command:</span>
              <Badge variant={lastCommand.action === 'unknown' ? 'destructive' : 'default'}>
                {lastCommand.action.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">"{lastCommand.command}"</p>
            {lastCommand.taskName && (
              <p className="text-gray-500 dark:text-gray-400">
                Task: <span className="font-medium">{lastCommand.taskName}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Help text */}
      {!isListening && !lastCommand && (
        <div className="text-center max-w-xs mt-2 space-y-2">

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
            <Keyboard className="w-3 h-3" />
            <span>Ctrl+K to activate</span>
          </div>
          <VoiceCommandsHelp />
        </div>
      )}
    </div>
  );
}
