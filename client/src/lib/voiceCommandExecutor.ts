// Voice Command Execution Handler using Groq AI Full Voice Mode
import { apiRequest, queryClient } from '@/lib/queryClient';
import { speakAssistantReply } from '@/lib/voiceOutput';

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
  onSuccess: (actions?: any[], reply?: string) => void,
  conversationHistory?: {role: string, content: string}[]
) {
  if (!transcript.trim()) {
    toast({ title: "No Voice Input", description: "Please speak a command.", variant: "destructive" });
    return;
  }

  // Helper to ensure AI-generated dates (which represent local time) are properly converted to UTC absolute time for the backend.
  // By stripping 'Z', the browser's new Date() parses it as local time, then .toISOString() converts it to absolute UTC.
  const ensureAbsoluteDate = (dateStr: string | undefined) => {
    if (!dateStr) return undefined;
    const cleanStr = dateStr.replace(/Z$/, '');
    const d = new Date(cleanStr);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  };

  try {
    // Build lightweight context to avoid exceeding token limits
    const context = {
      tasks: tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })),
      notes: notes.map(n => ({ id: n.id, title: n.title, isPinned: n.isPinned, isArchived: n.isArchived })),
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
        localTime: new Date().toString(),
        conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to parse command: ${response.statusText}`);
    }

    const { actions, response: assistantReply } = await response.json();

    if (!actions || actions.length === 0) {
      const reply = assistantReply || "I didn't catch that. You can ask me to manage tasks, notes, or calendar events.";
      toast({ title: "Voxa", description: reply });
      speakAssistantReply(reply);
      onSuccess([], reply);
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
            dueDate: ensureAbsoluteDate(action.deadline || action.dueDate) || undefined,
          });
          toast({ title: "Task Created", description: `Added "${action.title}"` });
          break;
        }
        case 'UPDATE_TASK': {
          if (!action.id || !tasks.find(t => t.id === action.id)) {
            toast({ title: "Task Not Found", description: "I couldn't find a task matching that command.", variant: "destructive" });
            break;
          }
          const updates = { ...action.updates };
          const deadlineStr = updates.deadline || updates.dueDate;
          if (deadlineStr) {
            updates.dueDate = ensureAbsoluteDate(deadlineStr);
            delete updates.deadline;
          }
          await updateTask.mutateAsync({ id: action.id, updates });
          
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
          if (!action.id || !tasks.find(t => t.id === action.id)) {
            toast({ title: "Task Not Found", description: "I couldn't find a task matching that command.", variant: "destructive" });
            break;
          }
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
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
          await apiRequest('PATCH', `/api/notes/${action.id}`, { content: action.content });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Updated", description: "The note was updated." });
          break;
        }
        case 'APPEND_NOTE': {
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
          const noteToAppend = notes.find(n => n.id === action.id);
          const currentContent = noteToAppend.content || "";
          const newContent = currentContent ? `${currentContent}\n\n${action.content}` : action.content;
          
          await apiRequest('PATCH', `/api/notes/${action.id}`, { content: newContent });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Updated", description: "Content was appended to the note." });
          break;
        }
        case 'DELETE_NOTE': {
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
          await apiRequest('PATCH', `/api/notes/${action.id}`, { isArchived: true });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Deleted", description: "The note was moved to the trash." });
          break;
        }
        case 'RESTORE_NOTE': {
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
          await apiRequest('PATCH', `/api/notes/${action.id}`, { isArchived: false });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Restored", description: "The note was restored." });
          break;
        }
        case 'PIN_NOTE': {
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
          await apiRequest('PATCH', `/api/notes/${action.id}`, { isPinned: true });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Pinned", description: "The note was pinned to the top." });
          break;
        }
        case 'UNPIN_NOTE': {
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
          await apiRequest('PATCH', `/api/notes/${action.id}`, { isPinned: false });
          queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
          toast({ title: "Note Unpinned", description: "The note is no longer pinned." });
          break;
        }
        case 'SUMMARIZE_NOTE':
        case 'POLISH_NOTE': {
          if (!action.id || !notes.find(n => n.id === action.id)) {
            toast({ title: "Note Not Found", description: "I couldn't find a note matching that command.", variant: "destructive" });
            break;
          }
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
          let start = ensureAbsoluteDate(action.startTime);
          if (!start) start = new Date().toISOString();
          
          let end = ensureAbsoluteDate(action.endTime);
          if (!end) {
            end = new Date(new Date(start).getTime() + 30 * 60000).toISOString();
          }

          await apiRequest('POST', '/api/events', {
            title: action.title,
            startTime: start,
            endTime: end,
            allDay: action.allDay || false,
          });
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({ title: "Event Scheduled", description: `Scheduled "${action.title}"` });
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: 'calendar' }));
          break;
        }
        case 'UPDATE_EVENT': {
          if (!action.id || !events.find(e => e.id === action.id)) {
            toast({ title: "Event Not Found", description: "I couldn't find an event matching that command.", variant: "destructive" });
            break;
          }
          const updates = { ...action.updates };
          if (updates.startTime) updates.startTime = ensureAbsoluteDate(updates.startTime);
          if (updates.endTime) updates.endTime = ensureAbsoluteDate(updates.endTime);
          
          await apiRequest('PATCH', `/api/events/${action.id}`, updates);
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({ title: "Event Updated", description: "The event was successfully updated." });
          break;
        }
        case 'DELETE_EVENT': {
          if (!action.id || !events.find(e => e.id === action.id)) {
            toast({ title: "Event Not Found", description: "I couldn't find an event matching that command.", variant: "destructive" });
            break;
          }
          await apiRequest('DELETE', `/api/events/${action.id}`);
          queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          toast({ title: "Event Deleted", description: "The event was successfully removed." });
          break;
        }
        case 'CHANGE_CALENDAR_VIEW': {
          window.dispatchEvent(new CustomEvent('voxa-calendar-view', { detail: action.view }));
          window.dispatchEvent(new CustomEvent('voxa-navigate', { detail: 'calendar' }));
          toast({ title: "View Changed", description: `Switched to ${action.view} view.` });
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

    const reply = assistantReply || buildCommandReply(actions);
    speakAssistantReply(reply);
    onSuccess(actions, reply);
  } catch (error) {
    console.error('Voice command error:', error);
    const reply = error instanceof Error ? `I couldn't complete that. ${error.message}` : "I couldn't complete that command. Please try again.";
    speakAssistantReply(reply);
    toast({ 
      title: "Command Failed", 
      description: error instanceof Error ? error.message : "Failed to execute command. Please try again.", 
      variant: "destructive" 
    });
    onSuccess([], reply);
  }
}

function buildCommandReply(actions: any[]) {
  if (!actions.length) return "I didn't find anything to do.";
  const first = actions[0];
  const title = first.title ? `: ${first.title}` : '';
  const actionNames: Record<string, string> = {
    CREATE_TASK: 'I added the task', UPDATE_TASK: 'I updated the task', DELETE_TASK: 'I deleted the task',
    CREATE_NOTE: 'I saved the note', UPDATE_NOTE: 'I updated the note', APPEND_NOTE: 'I added that to the note',
    DELETE_NOTE: 'I moved the note to the trash', RESTORE_NOTE: 'I restored the note', PIN_NOTE: 'I pinned the note',
    UNPIN_NOTE: 'I unpinned the note', SUMMARIZE_NOTE: 'I summarized the note', POLISH_NOTE: 'I polished the note',
    CREATE_EVENT: 'I scheduled the event', UPDATE_EVENT: 'I updated the event', DELETE_EVENT: 'I deleted the event',
    NAVIGATE: `I opened ${first.destination || 'that page'}`, CHANGE_CALENDAR_VIEW: `I switched to ${first.view || 'that'} calendar view`,
    OPEN_MODAL: `I opened ${first.modalName || 'that panel'}`, UPDATE_PROFILE: 'I updated your profile', TOGGLE_SETTING: 'I changed that setting'
  };
  const summary = actionNames[first.action] || 'Done';
  return actions.length > 1 ? `${summary}${title}, and completed ${actions.length - 1} more action${actions.length === 2 ? '' : 's'}.` : `${summary}${title}.`;
}
