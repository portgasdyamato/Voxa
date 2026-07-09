// Voice Command Execution Handler using Groq AI Full Voice Mode
import { apiRequest, queryClient } from '@/lib/queryClient';

export async function executeVoiceCommand(
  transcript: string,
  tasks: any[],
  notes: any[],
  events: any[],
  categories: any[],
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

  try {
    // Build lightweight context to avoid exceeding token limits
    const context = {
      tasks: tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })),
      notes: notes.map(n => ({ id: n.id, title: n.title, isPinned: n.isPinned })),
      events: events.map(e => ({ id: e.id, title: e.title, startTime: e.startTime })),
      categories: categories.map(c => ({ id: c.id, name: c.name }))
    };

    // Call the AI command endpoint
    const response = await fetch('/api/ai/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        transcript, 
        context,
        localTime: new Date().toString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse command: ${response.statusText}`);
    }

    const { actions } = await response.json();

    if (!actions || actions.length === 0) {
      toast({ title: "No Actions", description: "I couldn't understand what to do.", variant: "destructive" });
      return;
    }

    // Execute each action sequentially
    for (const action of actions) {
      switch (action.action) {
        // --- TASKS ---
        case 'CREATE_TASK': {
          await createTask.mutateAsync({
            title: action.title,
            priority: action.priority || 'medium',
            categoryId: action.categoryId || null,
            dueDate: action.deadline || undefined,
          });
          toast({ title: "Task Created", description: `Added "${action.title}"` });
          break;
        }
        case 'UPDATE_TASK': {
          await updateTask.mutateAsync({ id: action.id, updates: action.updates });
          
          if (action.updates && action.updates.completed !== undefined) {
            toast({ 
              title: action.updates.completed ? "Task Completed" : "Task Re-opened", 
              description: action.updates.completed ? "Great job!" : "Task is active again." 
            });
          } else {
            toast({ title: "Task Updated", description: "The task was updated." });
          }
          break;
        }
        case 'DELETE_TASK': {
          await deleteTask.mutateAsync(action.id);
          toast({ title: "Task Deleted", description: "The task was deleted." });
          break;
        }

        // --- NOTES ---
        case 'CREATE_NOTE': {
          await apiRequest('POST', '/api/notes', { title: action.title, content: action.content, isPinned: false });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Created", description: `Saved "${action.title}"` });
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: 'notes' }));
          break;
        }
        case 'UPDATE_NOTE': {
          await apiRequest('PATCH', `/api/notes/${action.id}`, action.updates);
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Updated", description: "The note was updated." });
          break;
        }
        case 'DELETE_NOTE': {
          await apiRequest('DELETE', `/api/notes/${action.id}`);
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Deleted", description: "The note was deleted." });
          break;
        }
        case 'PIN_NOTE': {
          await apiRequest('PATCH', `/api/notes/${action.id}`, { isPinned: true });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Pinned", description: "The note was pinned to the top." });
          break;
        }
        case 'SUMMARIZE_NOTE':
        case 'POLISH_NOTE': {
          const note = notes.find(n => n.id === action.id);
          if (note) {
            const formatAction = action.action === 'SUMMARIZE_NOTE' ? 'summarize' : 'polish';
            const aiRes = await apiRequest('POST', '/api/ai/format', { content: note.content, action: formatAction });
            const aiData = await aiRes.json();
            await apiRequest('PATCH', `/api/notes/${action.id}`, { content: aiData.content });
            queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
            toast({ title: `Note ${formatAction}d`, description: "The AI has processed your note." });
          }
          break;
        }

        // --- EVENTS ---
        case 'CREATE_EVENT': {
          await apiRequest('POST', '/api/events', {
            title: action.title,
            startTime: action.startTime,
            endTime: action.endTime,
            allDay: action.allDay || false,
          });
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({ title: "Event Scheduled", description: `Scheduled "${action.title}"` });
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: 'calendar' }));
          break;
        }
        case 'UPDATE_EVENT': {
          await apiRequest('PATCH', `/api/events/${action.id}`, action.updates);
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({ title: "Event Updated", description: "The event was successfully updated." });
          break;
        }
        case 'DELETE_EVENT': {
          await apiRequest('DELETE', `/api/events/${action.id}`);
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({ title: "Event Canceled", description: "The event was canceled." });
          break;
        }

        // --- UI & NAVIGATION ---
        case 'NAVIGATE': {
          let dest = action.destination;
          if (dest.startsWith('/')) {
            if (['/tasks', '/calendar', '/notes'].includes(dest)) {
              dest = dest.substring(1);
            }
          }
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: dest }));
          toast({ title: "Navigating", description: `Taking you to ${action.destination}...` });
          break;
        }
        case 'OPEN_MODAL': {
          if (action.modalName === 'settings') {
            window.dispatchEvent(new CustomEvent('voxa-open-profile-settings'));
          } else if (action.modalName === 'notifications') {
            window.dispatchEvent(new CustomEvent('voxa-open-notifications'));
          } else {
            window.dispatchEvent(new CustomEvent('voxa-open-modal', { detail: action.modalName }));
          }
          break;
        }
        case 'UPDATE_PROFILE': {
          await apiRequest('PATCH', '/api/profile', { firstName: action.firstName, lastName: action.lastName });
          queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
          toast({ title: "Profile Updated", description: "Your profile has been updated." });
          break;
        }
        case 'TOGGLE_SETTING': {
          if (action.setting === 'alarm_sound') {
            localStorage.setItem('voxa_alarm_sound', action.value.toString());
            window.dispatchEvent(new CustomEvent('voxa-toggle-sound', { detail: action.value }));
            toast({ title: "Sound Settings", description: `Alarm sound is now ${action.value ? 'ON' : 'OFF'}` });
          }
          break;
        }
        default:
          console.warn('Unknown action from AI:', action);
      }
    }

    onSuccess();
  } catch (error) {
    console.error('Voice command error:', error);
    toast({ 
      title: "Command Failed", 
      description: error.message || "Failed to execute command. Please try again.", 
      variant: "destructive" 
    });
  }
}
