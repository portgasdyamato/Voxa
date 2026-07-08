import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar as CalendarIcon, Clock, Type, AlignLeft, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<{ start: Date, end: Date } | null>(null);

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
  const { data: events = [], isLoading } = useQuery({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsModalOpen(false);
      form.reset();
    }
  });

  const handleExportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VoXa//EN\n";
    events.forEach((event: any) => {
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
    });
  };

  const formattedEvents = events.map((e: any) => ({
    id: String(e.id),
    title: e.title,
    start: e.startTime,
    end: e.endTime,
    allDay: e.allDay,
    extendedProps: {
      description: e.description,
      location: e.location,
      meetingLink: e.meetingLink
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
              border-radius: 6px;
              padding: 2px 4px;
              font-size: 0.8rem;
              transition: transform 0.2s;
              cursor: pointer;
            }
            .fc-event:hover {
              transform: scale(1.02);
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
            height="auto"
            contentHeight={700}
          />
        </div>
      </motion.div>

      {/* Event Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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
      </AnimatePresence>
    </div>
  );
}
