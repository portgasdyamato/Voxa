import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar as CalendarIcon, Clock, Type, AlignLeft, Download, Users, User, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date, end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Guest invites state
  const [guests, setGuests] = useState<{email: string, name: string}[]>([]);
  const [guestEmailInput, setGuestEmailInput] = useState('');
  const [isLookingUpGuest, setIsLookingUpGuest] = useState(false);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      allDay: false,
      startTime: '',
      endTime: '',
    }
  });

  // Fetch Events
  const { data: events = [] as any[] } = useQuery({
    queryKey: ['/api/events'],
  });

  // Event Drop mutation (Drag & Drop rescheduling)
  const updateEventMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: any }) => {
      await apiRequest('PATCH', `/api/events/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async (newEvent: any) => {
      await apiRequest('POST', '/api/events', newEvent);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsModalOpen(false);
      form.reset();
      
      if (variables.guests && variables.guests.length > 0) {
        toast({
          title: "Event created & Invites sent!",
          description: `Successfully emailed ${variables.guests.length} guest(s).`,
        });
      } else {
        toast({
          title: "Event created",
          description: "Your new event has been saved.",
        });
      }
      setGuests([]);
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setSelectedEvent(null);
      toast({
        title: "Event cancelled",
        description: "The event has been deleted and guests notified.",
      });
    }
  });

  const handleExportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VoXa//EN\n";
    (events as any[]).forEach((event: any) => {
      const dtStart = new Date(event.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const dtEnd = new Date(event.endTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${event.title}\n`;
      icsContent += `DTSTART:${dtStart}\n`;
      icsContent += `DTEND:${dtEnd}\n`;
      icsContent += "END:VEVENT\n";
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'voxa-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleEventDrop = (info: any) => {
    updateEventMutation.mutate({
      id: parseInt(info.event.id),
      updates: {
        startTime: info.event.start,
        endTime: info.event.end || info.event.start,
        allDay: info.event.allDay
      }
    });
  };

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate({
      start: selectInfo.start,
      end: selectInfo.end
    });
    form.setValue('startTime', selectInfo.start.toISOString().slice(0, 16));
    form.setValue('endTime', selectInfo.end.toISOString().slice(0, 16));
    form.setValue('allDay', selectInfo.allDay);
    setIsModalOpen(true);
  };

  const onSubmit = (data: any) => {
    createEventMutation.mutate({
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      guests: guests
    });
  };

  const handleAddGuest = async () => {
    if (!guestEmailInput || !guestEmailInput.includes('@')) return;
    setIsLookingUpGuest(true);
    try {
      const res = await fetch(`/api/users/lookup?email=${encodeURIComponent(guestEmailInput)}`);
      const data = await res.json();
      const name = data.name || guestEmailInput.split('@')[0];
      setGuests(prev => [...prev, { email: guestEmailInput, name }]);
      setGuestEmailInput('');
    } catch (e) {
      console.error("Failed to lookup guest", e);
    }
    setIsLookingUpGuest(false);
  };

  const handleEventClick = (info: any) => {
    const ev = (events as any[]).find((e: any) => e.id.toString() === info.event.id);
    if (ev) {
      setSelectedEvent(ev);
    }
  };

  const formattedEvents = (events as any[]).map((e: any) => ({
    id: String(e.id),
    title: e.title,
    start: e.startTime,
    end: e.endTime,
    allDay: e.allDay,
    extendedProps: {
      description: e.description,
      location: e.location,
      meetingLink: e.meetingLink,
      guests: e.guests
    }
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Calendar
          </h1>
          <p className="text-white/40 mt-1">Manage your schedule and upcoming meetings.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExportICS}
            variant="outline" 
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export ICS
          </Button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl"
      >
        <div className="calendar-container text-white">
          <style>{`
            .fc {
              --fc-border-color: rgba(255,255,255,0.1);
              --fc-button-text-color: #fff;
              --fc-button-bg-color: rgba(255,255,255,0.05);
              --fc-button-border-color: rgba(255,255,255,0.1);
              --fc-button-hover-bg-color: rgba(255,255,255,0.1);
              --fc-button-hover-border-color: rgba(255,255,255,0.2);
              --fc-button-active-bg-color: rgba(255,255,255,0.15);
              --fc-button-active-border-color: rgba(255,255,255,0.3);
              --fc-event-bg-color: rgba(59, 130, 246, 0.2);
              --fc-event-border-color: rgba(59, 130, 246, 0.5);
              --fc-event-text-color: #fff;
              --fc-today-bg-color: rgba(255,255,255,0.02);
              --fc-page-bg-color: transparent;
              --fc-neutral-bg-color: transparent;
              --fc-list-event-hover-bg-color: rgba(255,255,255,0.05);
              --fc-theme-standard-border-color: rgba(255,255,255,0.1);
            }
            .fc-header-toolbar {
              margin-bottom: 1.5rem !important;
            }
            .fc-toolbar-title {
              font-size: 1.5rem !important;
              font-weight: 600 !important;
            }
            .fc-event {
              border-radius: 8px !important;
              padding: 4px 8px !important;
              font-size: 0.85rem !important;
              font-weight: 500 !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.1)) !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
              backdrop-filter: blur(4px) !important;
              transition: transform 0.2s, box-shadow 0.2s !important;
              cursor: pointer;
              margin-bottom: 2px !important;
            }
            .fc-event:hover {
              transform: translateY(-1px) scale(1.02);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
              border-color: rgba(255, 255, 255, 0.2) !important;
            }
            .fc-event-title {
              font-weight: 600 !important;
              letter-spacing: 0.3px;
            }
            .fc-day-today {
              background: rgba(255,255,255,0.03) !important;
            }
            .fc-col-header-cell-cushion {
              padding: 12px 4px !important;
              font-weight: 500;
            }
          `}</style>
          
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="dayGridMonth"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={formattedEvents}
            select={handleDateSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventDrop}
            eventClick={handleEventClick}
            height="auto"
            contentHeight={700}
          />
        </div>
      </motion.div>

      {/* Event Details Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {selectedEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative top gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none" />

              <div className="flex justify-between items-start p-6 border-b border-white/5 relative z-10">
                <div>
                  <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-1">Event Details</h2>
                  <h3 className="text-3xl font-bold text-white tracking-tight">{selectedEvent.title}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedEvent(null)} className="text-white/40 hover:text-white hover:bg-white/5 rounded-full bg-black/20 backdrop-blur-md">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6 relative z-10">
                <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {format(new Date(selectedEvent.startTime), "EEEE, MMMM d")}
                    </p>
                    <p className="text-white/60 text-sm mt-0.5">
                      {format(new Date(selectedEvent.startTime), "h:mm a")} – {format(new Date(selectedEvent.endTime), "h:mm a")}
                    </p>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <AlignLeft className="w-4 h-4" /> Description
                    </h4>
                    <p className="text-white/80 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}
                
                {selectedEvent.guests && selectedEvent.guests.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-white/40 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Guests ({selectedEvent.guests.length})
                    </h4>
                    <div className="flex flex-col gap-3">
                      {selectedEvent.guests.map((g: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 bg-white/[0.03] rounded-2xl p-3 border border-white/5 hover:bg-white/[0.06] transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                            <span className="text-white font-medium text-sm">
                              {g.name ? g.name.charAt(0).toUpperCase() : g.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-white truncate">{g.name}</p>
                            <p className="text-xs text-white/50 truncate">{g.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel this event?")) {
                        deleteEventMutation.mutate(parseInt(selectedEvent.id));
                      }
                    }}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Event
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Event Creation Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c0c0e] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <h2 className="text-xl font-semibold text-white">Create Event</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Type className="w-4 h-4 text-white/40" />
                      <label className="text-sm text-white/60">Event Title</label>
                    </div>
                    <Input {...form.register('title')} required placeholder="e.g. Project Sync" className="bg-white/5 border-white/10 text-white" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-4 h-4 text-white/40" />
                        <label className="text-sm text-white/60">Start Time</label>
                      </div>
                      <Input type="datetime-local" {...form.register('startTime')} required className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-4 h-4 text-white/40" />
                        <label className="text-sm text-white/60">End Time</label>
                      </div>
                      <Input type="datetime-local" {...form.register('endTime')} required className="bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <Checkbox id="allDay" checked={form.watch('allDay')} onCheckedChange={(val) => form.setValue('allDay', val as boolean)} />
                    <label htmlFor="allDay" className="text-sm text-white/80">All day event</label>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <AlignLeft className="w-4 h-4 text-white/40" />
                      <label className="text-sm text-white/60">Description (Optional)</label>
                    </div>
                    <Textarea {...form.register('description')} placeholder="Add notes or location..." className="bg-white/5 border-white/10 text-white resize-none" rows={3} />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-4 h-4 text-white/40" />
                      <label className="text-sm text-white/60">Guests</label>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        value={guestEmailInput}
                        onChange={e => setGuestEmailInput(e.target.value)}
                        placeholder="guest@example.com"
                        className="bg-white/5 border-white/10 text-white flex-1"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGuest();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddGuest} disabled={isLookingUpGuest} className="bg-white/10 hover:bg-white/20">
                        Add
                      </Button>
                    </div>
                    {guests.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {guests.map((g, i) => (
                          <div key={i} className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-sm text-blue-400">
                            <span>{g.name}</span>
                            <button type="button" onClick={() => setGuests(guests.filter((_, idx) => idx !== i))} className="hover:text-blue-300">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white">Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? 'Saving...' : 'Save Event'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
