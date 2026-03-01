import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Mic, CheckCircle, Trash2, List, Eye, Plus, Calendar, Clock, Edit3, Bell, Activity } from 'lucide-react';

export function VoiceCommandsHelp() {
  const [open, setOpen] = useState(false);

  const commandCategories = [
    {
      title: "Mission Initiation (Date & Time)",
      icon: Calendar,
      color: "text-blue-600",
      commands: [
        { 
          command: "Add task [task name] [date] [time]",
          example: "Add task call John tomorrow at 5 PM",
          description: "Creates a task with a specific deadline"
        },
        { 
          command: "Remind me to [task name] [date]",
          example: "Remind me to pay bills tomorrow",
          description: "Creates a reminder for a specific date"
        },
        { 
          command: "Schedule [task name] [date] at [time]",
          example: "Schedule dentist appointment next Friday at 10 AM",
          description: "Schedule an appointment with date and time"
        },
        { 
          command: "Create task [task name] [time period]",
          example: "Create task workout tonight",
          description: "Creates a task for a specific time period"
        },
        { 
          command: "Add [task name] by [date]",
          example: "Add submit report by end of the week",
          description: "Creates a task with a deadline"
        },
        { 
          command: "New task [task name] [date] at [time]",
          example: "New task meeting with team tomorrow at 2:30",
          description: "Creates a task with precise date and time"
        }
      ]
    },
    {
      title: "Supported Date Expressions",
      icon: Calendar,
      color: "text-blue-600",
      commands: [
        { 
          command: "Today / Tomorrow",
          example: "Add task call mom today",
          description: "Use today, tomorrow, or day after tomorrow"
        },
        { 
          command: "Days of the Week",
          example: "Remind me to grocery shop Friday",
          description: "Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday"
        },
        { 
          command: "Next Week Days",
          example: "Schedule meeting next Monday",
          description: "next Monday, next Tuesday, etc."
        },
        { 
          command: "Weekend References",
          example: "Add task clean garage this weekend",
          description: "this weekend, next weekend"
        },
        { 
          command: "Week References",
          example: "Submit report by end of the week",
          description: "end of the week, beginning of next week"
        }
      ]
    },
    {
      title: "Supported Time Expressions",
      icon: Clock,
      color: "text-orange-600",
      commands: [
        { 
          command: "12-hour Format",
          example: "Meeting at 3 PM",
          description: "Use AM/PM: 9 AM, 3:30 PM, 10:15 AM"
        },
        { 
          command: "24-hour Format",
          example: "Call at 15:30",
          description: "Use 24-hour time: 09:00, 15:30, 20:45"
        },
        { 
          command: "Natural Times",
          example: "Workout tonight",
          description: "noon, midnight, morning, afternoon, evening, tonight"
        },
        { 
          command: "Meal Times",
          example: "Call at lunch time",
          description: "breakfast time, lunch time, dinner time"
        },
        { 
          command: "Simple Hour",
          example: "Meet at 5",
          description: "Just say 'at 5' for 5:00"
        }
      ]
    },
    {
      title: "Standard Mission Entry",
      icon: Plus,
      color: "text-green-600",
      commands: [
        { 
          command: "Add task [task name]",
          example: "Add task buy groceries",
          description: "Creates a new task with the specified name"
        },
        { 
          command: "Create task [task name]",
          example: "Create task finish project",
          description: "Alternative way to create a new task"
        },
        { 
          command: "New task [task name]",
          example: "New task call mom",
          description: "Another way to add a task"
        },
        { 
          command: "Add [task name] to my tasks",
          example: "Add workout to my tasks",
          description: "Natural way to add a task"
        },
        { 
          command: "Remind me to [task name]",
          example: "Remind me to pay bills",
          description: "Creates a reminder task"
        },
        { 
          command: "I need to [task name]",
          example: "I need to clean the house",
          description: "Natural language task creation"
        },
        { 
          command: "Schedule [task name]",
          example: "Schedule dentist appointment",
          description: "Schedule a task or appointment"
        },
        { 
          command: "Save [task name]",
          example: "Save write blog post",
          description: "Save a task quickly"
        },
        { 
          command: "Note [task name]",
          example: "Note buy birthday gift",
          description: "Take a note as a task"
        }
      ]
    },
    {
      title: "Mission Refinement",
      icon: Edit3,
      color: "text-indigo-600",
      commands: [
        {
          command: "Rename [old task name] to [new task name]",
          example: "Rename 'Lunch' to 'Dinner'",
          description: "Renames an existing task"
        },
        {
          command: "Change deadline for [task name] to [date] [time]",
          example: "Change deadline for 'Work' to tomorrow 5pm",
          description: "Updates the deadline of a task"
        },
        {
          command: "Update [task name] priority to [priority]",
          example: "Update 'Meeting' priority to high",
          description: "Changes the priority of a task"
        }
      ]
    },
    {
      title: "Reminders & Priority Management",
      icon: Bell,
      color: "text-amber-600",
      commands: [
        {
          command: "Set reminder for [task name] to [date] [time]",
          example: "Set reminder for 'Audit' to 3 PM",
          description: "Sets a reminder for a task"
        },
        {
          command: "Set urgency of [task name] to [priority]",
          example: "Set urgency of 'Tax' to high",
          description: "Sets the priority/urgency of a task"
        },
        {
          command: "Toggle reminder for [task name]",
          example: "Toggle reminder for 'Task'",
          description: "Toggles the reminder status of a task"
        }
      ]
    },
    {
      title: "Mission Removal",
      icon: Trash2,
      color: "text-rose-600",
      commands: [
        {
          command: "Delete [task name]",
          example: "Delete task 'Old Project'",
          description: "Deletes a specific task"
        },
        {
          command: "Remove [task name]",
          example: "Remove 'Grocery List'",
          description: "Removes a specific task"
        },
        {
          command: "Cancel [task name]",
          example: "Cancel 'Dinner Plan'",
          description: "Cancels and deletes a task"
        }
      ]
    },
    {
      title: "Mission Finalization",
      icon: CheckCircle,
      color: "text-blue-600",
      commands: [
        { 
          command: "Mark [task name] as done",
          example: "Mark laundry as done",
          description: "Marks a task as completed"
        },
        { 
          command: "Complete [task name]",
          example: "Complete homework",
          description: "Alternative way to mark task as done"
        },
        { 
          command: "Finish [task name]",
          example: "Finish exercise routine",
          description: "Mark task as finished"
        },
        { 
          command: "Check off [task name]",
          example: "Check off grocery shopping",
          description: "Another way to complete a task"
        },
        { 
          command: "Done with [task name]",
          example: "Done with meeting notes",
          description: "Mark task as completed"
        },
        { 
          command: "Mark [task name] as pending",
          example: "Mark shopping as pending",
          description: "Marks a completed task as pending again"
        }
      ]
    },
    {
      title: "Task Lifecycle Management",
      icon: Trash2,
      color: "text-red-600",
      commands: [
        { 
          command: "Delete [task name]",
          example: "Delete old task",
          description: "Permanently removes a task"
        },
        { 
          command: "Remove [task name]",
          example: "Remove cancelled meeting",
          description: "Alternative way to delete a task"
        }
      ]
    },
    {
      title: "Visual Intelligence (Viewing)",
      icon: Eye,
      color: "text-blue-600",
      commands: [
        { 
          command: "Show me today's tasks",
          example: "Show me today's tasks",
          description: "Lists all tasks for today with completion status"
        },
        { 
          command: "What are my pending tasks",
          example: "What are my pending tasks",
          description: "Lists all incomplete tasks with priority info"
        },
        { 
          command: "Show me completed tasks",
          example: "Show me completed tasks",
          description: "Lists all finished tasks"
        },
        { 
          command: "What do I have to do",
          example: "What do I have to do today",
          description: "Shows your task list"
        },
        { 
          command: "Tell me my tasks",
          example: "Tell me my tasks",
          description: "Alternative way to list tasks"
        }
      ]
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-white/50 hover:text-white hover:bg-white/[0.06] transition-all rounded-xl">
          <HelpCircle className="w-3.5 h-3.5 mr-1.5" />
          Voice Commands Help
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10] shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.06] bg-[#0a0a0a] flex-shrink-0 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          <DialogTitle className="flex items-center space-x-3 text-xl font-black tracking-tight text-white relative z-10">
            <Mic className="w-5 h-5 text-primary" />
            <span>Voice Command Guide</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Scrollable body */}
        <div className="px-6 py-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          
          <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
               <Activity className="w-16 h-16" />
             </div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3 relative z-10">How it works</h4>
            <ol className="text-sm text-white/70 space-y-2.5 font-medium relative z-10">
              <li className="flex gap-3"><span className="text-primary font-black opacity-50">01</span> Activate the microphone or press Ctrl+K</li>
              <li className="flex gap-3"><span className="text-primary font-black opacity-50">02</span> Speak clearly in natural language</li>
              <li className="flex gap-3"><span className="text-primary font-black opacity-50">03</span> Confirm or wait out the auto-save</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
              <h4 className="font-bold text-white mb-2 text-sm">Smart Priority</h4>
              <p className="text-xs text-white/50 mb-3">Auto-detects from tone markers:</p>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                <li><strong className="text-rose-400">High:</strong> urgent, ASAP, critical</li>
                <li><strong className="text-emerald-400">Low:</strong> later, eventually</li>
              </ul>
            </div>
            
            <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06]">
              <h4 className="font-bold text-white mb-2 text-sm">Natural Dates</h4>
              <p className="text-xs text-white/50 mb-3">Say time normally:</p>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc list-inside">
                <li><strong className="text-white">Dates:</strong> tomorrow, next Friday</li>
                <li><strong className="text-white">Times:</strong> noon, 5 PM, tonight</li>
              </ul>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            {commandCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <div className="flex items-center space-x-2.5 pt-4">
                  <category.icon className="w-4 h-4 text-white/50" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">{category.title}</h3>
                </div>
                
                <div className="grid gap-2">
                  {category.commands.map((cmd, cmdIndex) => (
                    <div key={cmdIndex} className="border border-white/[0.06] rounded-xl p-3 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:bg-white/[0.05] transition-colors">
                      <div className="space-y-1 flex-1">
                        <code className="text-sm font-semibold text-primary/90 flex items-center gap-2">
                          {cmd.command}
                        </code>
                        <p className="text-xs text-white/40">{cmd.description}</p>
                      </div>
                      <div className="text-[11px] font-medium text-white/30 truncate max-w-[200px] shrink-0">
                         e.g. "{cmd.example}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-500/10 rounded-2xl p-5 border border-amber-500/20">
            <h4 className="font-bold text-amber-500 mb-2 text-sm">Pro Tips</h4>
            <ul className="text-xs text-amber-500/70 space-y-1.5 list-disc list-inside">
              <li>Speak at a normal pace</li>
              <li>Names match using fuzzy search (close variations work)</li>
              <li>Wait for the beep before giving a command</li>
            </ul>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}
