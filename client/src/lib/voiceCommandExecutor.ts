// Voice Command Execution Handler
// This file contains the comprehensive handler for executing all voice commands

import { parseVoiceCommand, findTaskByIdentifier } from '@/lib/voiceCommands';
import { parseTaskFromSpeech } from '@/lib/dateDetection';
import { parseCategoryFromText } from '@/lib/categoryDetection';
import { apiRequest, queryClient } from '@/lib/queryClient';

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
  onSuccess: () => void,
  overriddenTitle?: string,
  categories?: any[]
) {
  if (!transcript.trim()) {
    toast({ title: "No Voice Input", description: "Please speak a command.", variant: "destructive" });
    return;
  }

  const command = parseVoiceCommand(transcript, categories || [], tasks || []);

  try {
    switch (command.type) {
      case 'add': {
        const { taskName: parsedName, deadline, priority } = parseTaskFromSpeech(transcript);
        let taskName = (overriddenTitle || parsedName || '').trim();
        const finalDeadline = selectedDeadline || deadline;
        
        let finalCategoryId: number | undefined = undefined;
        if (selectedCategory && selectedCategory !== 'none' && selectedCategory !== '') {
          const parsed = parseInt(selectedCategory);
          if (!isNaN(parsed)) {
            finalCategoryId = parsed;
          }
        }

        // Auto-detect category if not explicitly selected
        if (finalCategoryId === undefined && categories) {
          const { categoryId: detectedId, cleanedText: finalCleanedName } = parseCategoryFromText(taskName, categories);
          if (detectedId) {
            finalCategoryId = detectedId;
            taskName = finalCleanedName;
          }
        }
        
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
          categoryId: finalCategoryId || null,
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
        if (command.targetReference === 'last') {
          const count = command.targetCount || 1;
          const sorted = [...(tasks || [])].sort((a, b) => b.id - a.id);
          const targetTasks = sorted.slice(0, count);
          if (!targetTasks.length) return;
          for (const t of targetTasks) await deleteTask.mutateAsync(t.id);
          toast({ title: "Tasks Deleted", description: `Deleted last ${count} task(s)` });
          if (onSuccess) onSuccess();
          return;
        }

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
        if (command.targetReference === 'last') {
          const count = command.targetCount || 1;
          const sorted = [...(tasks || [])].sort((a, b) => b.id - a.id);
          const targetTasks = sorted.slice(0, count);
          if (!targetTasks.length) return;
          for (const t of targetTasks) await updateTask.mutateAsync({ id: t.id, updates: { completed: true } });
          toast({ title: "Tasks Completed", description: `Completed last ${count} task(s)` });
          if (onSuccess) onSuccess();
          return;
        }

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
        if (command.targetReference === 'last') {
          const count = command.targetCount || 1;
          const sorted = [...(tasks || [])].sort((a, b) => b.id - a.id);
          const targetTasks = sorted.slice(0, count);
          if (!targetTasks.length) return;
          for (const t of targetTasks) await updateTask.mutateAsync({ id: t.id, updates: { completed: false } });
          toast({ title: "Tasks Reopened", description: `Reopened last ${count} task(s)` });
          if (onSuccess) onSuccess();
          return;
        }

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
        if (command.targetReference === 'last') {
          const count = command.targetCount || 1;
          const sorted = [...(tasks || [])].sort((a, b) => b.id - a.id);
          const targetTasks = sorted.slice(0, count);
          if (!targetTasks.length) return;
          const updates: any = {};
          if (command.updates?.title) updates.title = command.updates.title;
          if (command.updates?.deadline) updates.dueDate = command.updates.deadline.toISOString();
          for (const t of targetTasks) await updateTask.mutateAsync({ id: t.id, updates });
          toast({ title: "Tasks Updated", description: `Updated last ${count} task(s)` });
          if (onSuccess) onSuccess();
          return;
        }

        if (!command.taskIdentifier || (!command.updates?.title && !command.updates?.deadline)) {
          toast({ title: "Error", description: "Please specify the task and what to change (name or time).", variant: "destructive" });
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

        const updates: any = {};
        if (command.updates?.title) updates.title = command.updates.title;
        if (command.updates?.deadline) updates.dueDate = command.updates.deadline.toISOString();

        await updateTask.mutateAsync({
          id: task.id,
          updates
        });

        toast({
          title: "Task Updated",
          description: command.updates?.title 
            ? `Renamed to "${command.updates.title}"` 
            : `Rescheduled for ${command.updates?.deadline?.toLocaleString()}`,
        });
        break;
      }

      case 'schedule_event': {
        if (!command.eventDetails) {
          toast({ title: "Error", description: "Missing event details.", variant: "destructive" });
          return;
        }
        try {
          await apiRequest('POST', '/api/events', {
            title: command.eventDetails.title,
            startTime: command.eventDetails.startTime.toISOString(),
            endTime: command.eventDetails.endTime.toISOString(),
            allDay: command.eventDetails.allDay || false,
          });
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({
            title: "Event Scheduled",
            description: `Scheduled "${command.eventDetails.title}" for ${command.eventDetails.startTime.toLocaleDateString()}`,
          });
          // Dispatch a navigation event to calendar to show the newly added event
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: '/calendar' }));
          if (onSuccess) onSuccess();
        } catch (e: any) {
          toast({ title: "Failed to schedule", description: e.message, variant: "destructive" });
        }
        break;
      }

      case 'create_note': {
        if (!command.noteDetails) {
          toast({ title: "Error", description: "Missing note details.", variant: "destructive" });
          return;
        }
        try {
          await apiRequest('POST', '/api/notes', {
            title: command.noteDetails.title,
            content: command.noteDetails.content,
            isPinned: false
          });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({
            title: "Note Created",
            description: `Saved note: "${command.noteDetails.title}"`,
          });
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: '/notes' }));
          if (onSuccess) onSuccess();
        } catch (e: any) {
          toast({ title: "Failed to create note", description: e.message, variant: "destructive" });
        }
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

      case 'navigate': {
        if (!command.destination) return;
        window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: command.destination }));
        toast({
          title: "Navigating",
          description: `Taking you to ${command.destination === '/stats' ? 'Analytics' : 'Workspace'}...`,
        });
        break;
      }

      case 'open_modal': {
        if (!command.modalName) return;
        
        if (command.modalName === 'settings') {
          window.dispatchEvent(new CustomEvent('voxa-open-profile-settings'));
          toast({ title: "Settings", description: "Opening account settings..." });
        } else if (command.modalName === 'notifications') {
          window.dispatchEvent(new CustomEvent('voxa-open-notifications'));
          toast({ title: "Notifications", description: "Opening notifications..." });
        } else {
          window.dispatchEvent(new CustomEvent('voxa-open-modal', { detail: command.modalName }));
          toast({ title: "Opening", description: `Opening New Task dialog...` });
        }
        break;
      }

      case 'toggle_sound': {
        const current = localStorage.getItem('voxa_alarm_sound') !== 'false';
        const nextState = !current;
        localStorage.setItem('voxa_alarm_sound', nextState.toString());
        window.dispatchEvent(new CustomEvent('voxa-toggle-sound', { detail: nextState }));
        
        // Update DOM element for dropdown if it exists
        const el = document.getElementById('alarm-sound-status');
        if (el) el.textContent = nextState ? 'On' : 'Off';
        
        toast({
          title: "Sound Preferences",
          description: `Alarm sound is now ${nextState ? 'ON' : 'OFF'}`,
        });
        break;
      }

      case 'set_filter': {
        if (command.categoryId !== undefined) {
          window.dispatchEvent(new CustomEvent('voxa-set-category', { detail: command.categoryId }));
          const catName = categories?.find(c => c.id === command.categoryId)?.name || 'Category';
          toast({
            title: "Filtering",
            description: `Showing ${catName} tasks`,
          });
          break;
        }

        if (!command.filterId) return;
        window.dispatchEvent(new CustomEvent('voxa-set-filter', { detail: command.filterId }));
        let filterName = 'All tasks';
        if (command.filterId === 'today') filterName = "Today's tasks";
        if (command.filterId === 'overdue') filterName = "Priority/Overdue tasks";
        toast({
          title: "Filtering",
          description: `Showing ${filterName}`,
        });
        break;
      }

      case 'search': {
        if (!command.searchQuery) return;
        window.dispatchEvent(new CustomEvent('voxa-search', { detail: command.searchQuery }));
        toast({
          title: "Searching",
          description: `Looking for "${command.searchQuery}"`,
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
