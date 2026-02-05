// Voice Command Execution Handler
// This file contains the comprehensive handler for executing all voice commands

import { parseVoiceCommand, findTaskByIdentifier } from '@/lib/voiceCommands';
import { parseTaskFromSpeech } from '@/lib/dateDetection';

export async function executeVoiceCommand(
  transcript: string,
  tasks: any[],
  selectedCategory: string,
  selectedDeadline: Date | null,
  reminderEnabled: boolean,
  reminderType: string,
  reminderTime: string,
  createTask: any,
  updateTask: any,
  deleteTask: any,
  toast: any,
  onSuccess: () => void
) {
  if (!transcript.trim()) {
    toast({ title: "No Voice Input", description: "Please speak a command.", variant: "destructive" });
    return;
  }

  const command = parseVoiceCommand(transcript);

  try {
    switch (command.type) {
      case 'add': {
        const { taskName, deadline, priority } = parseTaskFromSpeech(transcript);
        const finalDeadline = selectedDeadline || deadline;
        
        if (!taskName || taskName.length < 2) {
          toast({ 
            title: "Invalid Task", 
            description: "Could not understand the task name. Please try again.", 
            variant: "destructive" 
          });
          return;
        }
        
        await createTask.mutateAsync({
          title: taskName,
          description: undefined,
          priority,
          categoryId: selectedCategory && selectedCategory !== 'none' ? parseInt(selectedCategory) : undefined,
          dueDate: finalDeadline ? finalDeadline.toISOString() : undefined,
          reminderEnabled,
          reminderType,
          reminderTime: reminderType === 'manual' ? reminderTime : undefined,
        });

        toast({
          title: "Task Created",
          description: `Added "${taskName.slice(0, 40)}${taskName.length > 40 ? '...' : ''}"`,
        });
        break;
      }

      case 'delete': {
        if (!command.taskIdentifier) {
          toast({ title: "Error", description: "Please specify which task to delete.", variant: "destructive" });
          return;
        }

        const task = findTaskByIdentifier(tasks || [], command.taskIdentifier);
        if (!task) {
          toast({ 
            title: "Task Not Found", 
            description: `Could not find task "${command.taskIdentifier}"`, 
            variant: "destructive" 
          });
          return;
        }

        await deleteTask.mutateAsync(task.id);
        toast({
          title: "Task Deleted",
          description: `Deleted "${task.title}"`,
        });
        break;
      }

      case 'complete': {
        if (!command.taskIdentifier) {
          toast({ title: "Error", description: "Please specify which task to complete.", variant: "destructive" });
          return;
        }

        const task = findTaskByIdentifier(tasks || [], command.taskIdentifier);
        if (!task) {
          toast({ 
            title: "Task Not Found", 
            description: `Could not find task "${command.taskIdentifier}"`, 
            variant: "destructive" 
          });
          return;
        }

        await updateTask.mutateAsync({
          id: task.id,
          updates: { completed: true }
        });

        toast({
          title: "Task Completed",
          description: `Marked "${task.title}" as complete`,
        });
        break;
      }

      case 'uncomplete': {
        if (!command.taskIdentifier) {
          toast({ title: "Error", description: "Please specify which task to reopen.", variant: "destructive" });
          return;
        }

        const task = findTaskByIdentifier(tasks || [], command.taskIdentifier);
        if (!task) {
          toast({ 
            title: "Task Not Found", 
            description: `Could not find task "${command.taskIdentifier}"`, 
            variant: "destructive" 
          });
          return;
        }

        await updateTask.mutateAsync({
          id: task.id,
          updates: { completed: false }
        });

        toast({
          title: "Task Reopened",
          description: `Reopened "${task.title}"`,
        });
        break;
      }

      case 'update': {
        if (!command.taskIdentifier || !command.updates?.title) {
          toast({ title: "Error", description: "Please specify the task and new name.", variant: "destructive" });
          return;
        }

        const task = findTaskByIdentifier(tasks || [], command.taskIdentifier);
        if (!task) {
          toast({ 
            title: "Task Not Found", 
            description: `Could not find task "${command.taskIdentifier}"`, 
            variant: "destructive" 
          });
          return;
        }

        await updateTask.mutateAsync({
          id: task.id,
          updates: { title: command.updates.title }
        });

        toast({
          title: "Task Updated",
          description: `Renamed to "${command.updates.title}"`,
        });
        break;
      }

      case 'list': {
        const taskCount = tasks?.length || 0;
        const completedCount = tasks?.filter((t: any) => t.completed).length || 0;
        const pendingCount = taskCount - completedCount;

        toast({
          title: "Your Tasks",
          description: `You have ${pendingCount} pending and ${completedCount} completed tasks.`,
        });
        break;
      }

      case 'clear_completed': {
        const completedTasks = tasks?.filter((t: any) => t.completed) || [];
        
        if (completedTasks.length === 0) {
          toast({
            title: "No Completed Tasks",
            description: "There are no completed tasks to clear.",
          });
          return;
        }

        for (const task of completedTasks) {
          await deleteTask.mutateAsync(task.id);
        }

        toast({
          title: "Completed Tasks Cleared",
          description: `Deleted ${completedTasks.length} completed tasks`,
        });
        break;
      }

      default: {
        toast({ 
          title: "Unknown Command", 
          description: "I didn't understand that command. Try 'add', 'delete', 'complete', or 'list tasks'.", 
          variant: "destructive" 
        });
        return;
      }
    }

    onSuccess();
  } catch (error) {
    console.error('Voice command error:', error);
    toast({ 
      title: "Error", 
      description: "Failed to execute command. Please try again.", 
      variant: "destructive" 
    });
  }
}
