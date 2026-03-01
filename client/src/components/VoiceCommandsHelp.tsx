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
        <Button variant="ghost" size="sm" className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
          <HelpCircle className="w-3 h-3 mr-1" />
          Voice Commands Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[3rem] border-2 border-border/40 bg-card/95 backdrop-blur-3xl shadow-3xl p-0">
        <DialogHeader className="p-10 pb-6 relative overflow-hidden bg-primary/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
          <DialogTitle className="flex items-center space-x-3 text-3xl font-black tracking-tighter italic relative z-10 uppercase">
            <Mic className="w-8 h-8 text-primary shadow-lg shadow-primary/20" />
            <span>Command Protocol</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-10 pt-4 space-y-10">
          <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5">
               <Activity className="w-20 h-20" />
             </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Command Execution Flow</h4>
            <ol className="text-sm text-foreground/70 space-y-3 font-medium">
              <li className="flex gap-4"><span className="text-primary font-black">01</span> Activate the microphone to start audio scanning</li>
              <li className="flex gap-4"><span className="text-primary font-black">02</span> Speak clearly for natural language processing</li>
              <li className="flex gap-4"><span className="text-primary font-black">03</span> Verify the identified intent in the transcription bay</li>
              <li className="flex gap-4"><span className="text-primary font-black">04</span> Operations execute instantly upon voice confirmation</li>
            </ol>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Smart Priority Detection</h4>
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              When creating tasks, the system can automatically detect priority based on keywords:
            </p>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1 list-disc list-inside">
              <li><strong>High Priority:</strong> urgent, important, ASAP, immediately, critical</li>
              <li><strong>Low Priority:</strong> later, when I have time, eventually, sometime</li>
              <li><strong>Example:</strong> "Add urgent task submit report" → Creates high priority task</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">🎯 Natural Language Date & Time Detection</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              The system automatically detects dates and times from natural speech:
            </p>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <div>
                <strong>📅 Date Detection:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>today, tomorrow, next Friday, this weekend</li>
                  <li>in 3 days, next week, in two weeks</li>
                  <li>Monday, Tuesday, etc. (defaults to next occurrence)</li>
                </ul>
              </div>
              <div>
                <strong>🕒 Time Detection:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>5 PM, 2:30 PM, 9 AM, 11:30</li>
                  <li>noon, midnight, morning, afternoon, evening</li>
                  <li>lunch time, dinner time, bedtime</li>
                </ul>
              </div>
              <div>
                <strong>✨ Smart Examples:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>"Call John tomorrow at 5 PM" → Task: "Call John", Due: Tomorrow 5:00 PM</li>
                  <li>"Meeting Friday at 2:30" → Task: "Meeting", Due: Friday 2:30 PM</li>
                  <li>"Submit report by Monday noon" → Task: "Submit report", Due: Monday 12:00 PM</li>
                  <li>"Doctor appointment next week at 3" → Task: "Doctor appointment", Due: Next week 3:00 PM</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Keyboard Shortcuts</h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <div className="flex items-center space-x-2">
                <kbd className="bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded text-xs font-mono">Ctrl + K</kbd>
                <span>Activate voice commands</span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Press Ctrl+K anywhere in the app to start listening for voice commands
              </p>
            </div>
          </div>

          {commandCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-3">
              <div className="flex items-center space-x-2">
                <category.icon className={`w-5 h-5 ${category.color} dark:${category.color.replace('600', '400')}`} />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{category.title}</h3>
              </div>
              
              <div className="grid gap-3">
                {category.commands.map((cmd, cmdIndex) => (
                  <div key={cmdIndex} className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <code className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                        {cmd.command}
                      </code>
                      <Badge variant="outline" className="text-xs">
                        Voice
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{cmd.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Example:</span> "{cmd.example}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Tips for Better Recognition</h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
              <li>Speak clearly and at a normal pace</li>
              <li>Use the exact task name or close variations</li>
              <li>Ensure you're in a quiet environment</li>
              <li>If a command fails, try rephrasing it</li>
              <li>Task names are matched using fuzzy search</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
