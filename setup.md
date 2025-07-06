# Voice Task Manager - Local Development Setup

## Quick Start Guide

### Step 1: Set up Google OAuth

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select an existing one
3. **Enable the Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
   - Copy the Client ID and Client Secret

### Step 2: Choose Database Option

### Option 1: Using Neon (Free PostgreSQL Database) - Recommended

1. **Create a free account at [Neon.tech](https://neon.tech)**
2. **Create a new database project**
3. **Copy your connection string** (it will look like: `postgresql://username:password@hostname/dbname`)
4. **Update your `.env` file** with the connection string and Google OAuth credentials:
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_vylQ8L5iXCZt@ep-proud-haze-a89aeo5b-pooler.eastus2.azure.neon.tech/neondb?sslmode=require
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```
5. **Install dependencies**:
   ```
   npm install
   ```
6. **Push the database schema**:
   ```
   npm run db:push
   ```
7. **Start the development server**:
   ```
   npm run dev
   ```

### Option 2: Using Docker (If you have Docker installed)

1. **Start PostgreSQL container**:
   ```
   docker run --name voice-task-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=voice_task_manager -p 5432:5432 -d postgres:15
   ```
2. **Update your `.env` file**:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/voice_task_manager
   ```
3. **Push the database schema**:
   ```
   npm run db:push
   ```
4. **Start the development server**:
   ```
   npm run dev
   ```

### Option 3: Using Supabase (Alternative free option)

1. **Create account at [Supabase.com](https://supabase.com)**
2. **Create a new project**
3. **Go to Settings > Database**
4. **Copy the connection string**
5. **Update your `.env` file** with the connection string
6. **Push the database schema**:
   ```
   npm run db:push
   ```
7. **Start the development server**:
   ```
   npm run dev
   ```

## Project Features

- **Voice Task Creation**: Use voice commands to create tasks
- **Smart Date Detection**: Automatically detects deadlines from voice input (e.g., "tomorrow", "next Friday")
- **Deadline Management**: Set specific due dates with visual deadline indicators
- **Advanced Reminder System**: 
  - **Default Reminders**: Notifications 2 hours before deadline
  - **Morning Reminders**: Notifications at 8:00 AM for tasks due that day
  - **Manual Time Reminders**: Set custom notification times
- **Flexible Notification Types**: Choose between different reminder styles for each task
- **Category Assignment**: Assign categories to tasks after voice transcription
- **AI Priority Detection**: Automatically detects task priority from voice input
- **Advanced Filtering**: Filter tasks by category, deadline, and completion status
- **Task Management**: Complete, edit, and delete tasks with category and deadline filtering
- **Category Management**: Create, edit, and delete custom categories with colors
- **Voice Commands for Management**: Hands-free task management with natural language commands
  - **Task Completion**: "Mark laundry as done", "Complete homework"
  - **Task Status**: "Mark shopping as pending" 
  - **Task Deletion**: "Delete old task", "Remove cancelled meeting"
  - **Task Viewing**: "Show me today's tasks", "What are my pending tasks"
  - **Smart Fuzzy Matching**: Finds tasks even with slight name variations
  - **Keyboard Shortcut**: Press Ctrl+K (or Cmd+K on Mac) to activate voice commands
- **Statistics Dashboard**: View task completion statistics
- **Modern UI**: Glass-morphism design with Tailwind CSS
- **Local Development**: No external dependencies - runs completely locally

## Authentication

The app uses Google OAuth for authentication. Users can sign in with their Google accounts to access the task manager.

### Setting up Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:5000/auth/google/callback` as authorized redirect URI
6. Copy Client ID and Client Secret to your `.env` file

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Make sure your `DATABASE_URL` is correct and the database is accessible
2. **Port Already in Use**: If you get `EADDRINUSE` error, kill the process:
   ```bash
   # Find process using port 5000
   netstat -ano | findstr :5000
   # Kill the process (replace PID with actual process ID)
   taskkill /PID [PID] /F
   ```
3. **Voice Recognition Not Working**: Make sure you're using HTTPS or localhost
4. **Notifications Not Working**: 
   - Enable notifications in your browser
   - Test with the "Test Notifications" button
   - Create a test task with the "Create Test Task" button
   - Check browser console for errors
5. **Authentication Issues**: Verify your Google OAuth credentials are correct

### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema
- `npm run check` - Type checking

### Testing Deadline Notifications

1. **Enable Notifications**: Click "Enable" in the notification alert
2. **Test Browser Notifications**: Click "Test Notifications" button to verify notifications work
3. **Create Real Tasks**: Use voice input to create tasks with deadlines and different reminder types
4. **Monitor Notifications**: Notifications will appear according to your selected reminder settings:
   - **Default**: 2 hours before deadline
   - **Morning**: At 8:00 AM on the day task is due
   - **Manual**: At your specified time on the day task is due
5. **Check Console**: Open browser developer tools to see notification logs in development mode

## Environment Variables

Make sure to set these in your `.env` file:

```env
DATABASE_URL=your_database_connection_string
SESSION_SECRET=your_random_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
NODE_ENV=development
PORT=5000
```

## Next Steps

1. Choose one of the database options above
2. Update your `.env` file with the database connection
3. Run `npm run db:push` to create the database tables
4. Run `npm run dev` to start the application
5. Open http://localhost:5000 in your browser

The application will be available at `http://localhost:5000`

## Usage

### Creating Voice Tasks with Categories, Deadlines, and Reminders

1. **Click "Add Voice Task"** to open the voice input modal
2. **Start Recording** and speak your task clearly
   - Include deadlines naturally: "Call mom tomorrow", "Submit report by Friday"
   - System automatically detects common date phrases
3. **Review the transcription** and detected priority
4. **Select a category** from the dropdown (optional)
5. **Set or adjust the deadline** using the date picker (optional)
   - Auto-detected dates will be pre-filled
   - You can manually adjust or remove deadlines
6. **Configure reminder settings** (if deadline is set):
   - **Default**: Get notified 2 hours before deadline
   - **Morning Only**: Get notified at 8:00 AM on the day task is due
   - **Custom Time**: Set specific notification time
7. **Save the task** - it will be created with your selected settings

### Managing Tasks with Advanced Reminders

- **Visual Indicators**: Tasks show deadline status with color-coded badges
  - Red: Overdue tasks
  - Orange: Due today  
  - Yellow: Due tomorrow
  - Gray: Future deadlines
- **Deadline Filtering**: Filter tasks by deadline status
  - All Tasks, Due Today, Due Tomorrow, This Week, Overdue, No Deadline
- **Smart Reminder Types**:
  - **Default**: Notifications appear 2 hours before deadline
  - **Morning**: Notifications at 8:00 AM for tasks due that day
  - **Manual**: Custom time notifications (e.g., 3:00 PM reminder)
- **Smart Detection**: Voice input automatically detects dates like:
  - "today", "tomorrow", "next week"
  - "Monday", "Friday", "this weekend"
  - "in 3 days", "next month"

### Category Management

- **Create new categories** with custom names and colors
- **Edit existing categories** to change names or colors
- **Delete categories** (tasks will become uncategorized)
- **Filter tasks** by category in the main task view

### Advanced Notification System

- **Enable Notifications**: Click "Enable" in the notification alert to receive deadline reminders
- **Test Notifications**: Click "Test Notifications" button to verify browser notifications work
- **Smart Reminder Types**:
  - **Default**: Notifications appear 2 hours before deadline
  - **Morning**: Notifications at 8:00 AM for tasks due that day
  - **Manual**: Custom time notifications (e.g., 3:00 PM reminder)
- **Flexible Configuration**: Set different reminder types for each task during creation
- **Debug Mode**: Development environment shows notification status and console logs

## Voice Commands Usage

The Voice Task Manager now supports natural language voice commands for hands-free task management. Here's how to use them:

### Activating Voice Commands

1. **Click the microphone button** on the home page
2. **Use keyboard shortcut**: Press `Ctrl+K` (or `Cmd+K` on Mac)
3. **Wait for the "Listening..." indicator** and speak your command clearly

### Available Commands

#### Task Creation
- `"Add task [task name]"` - Create a new task
- `"Create task [task name]"` - Alternative task creation command
- `"New task [task name]"` - Another way to create tasks
- `"Add [task name] to my tasks"` - Natural language task creation
- `"Remind me to [task name]"` - Create a reminder task
- `"I need to [task name]"` - Natural language task creation
- `"Don't forget to [task name]"` - Create a reminder task
- `"Schedule [task name]"` - Schedule a task or appointment
- `"Save [task name]"` - Quick task creation
- `"Note [task name]"` - Take a note as a task

#### Task Completion
- `"Mark [task name] as done"` - Mark a task as completed
- `"Complete [task name]"` - Alternative completion command
- `"Check off [task name]"` - Another way to complete tasks
- `"Mark [task name] as pending"` - Mark a completed task as pending again

#### Task Management
- `"Delete [task name]"` - Permanently remove a task
- `"Remove [task name]"` - Alternative deletion command
- `"Cancel [task name]"` - Another way to delete tasks

#### Task Viewing
- `"Show me today's tasks"` - List all today's tasks with completion status
- `"What are my pending tasks"` - List incomplete tasks with priority info
- `"Show me completed tasks"` - List all finished tasks
- `"What do I have to do"` - Show your task list
- `"Tell me my tasks"` - Alternative way to list tasks

### Smart Task Matching

The voice command system uses intelligent fuzzy matching to find tasks:

- **Exact matches**: Finds tasks with the exact name you spoke
- **Partial matches**: Finds tasks containing the words you spoke
- **Word-based matching**: Matches tasks based on individual words
- **Typo tolerance**: Handles minor speech recognition errors
- **Common variations**: Understands different ways of saying the same thing

### Smart Priority Detection

When creating tasks with voice commands, the system automatically detects priority based on keywords:

- **High Priority Keywords**: urgent, important, ASAP, immediately, critical, high priority
- **Low Priority Keywords**: later, when I have time, eventually, sometime, low priority
- **Default Priority**: Tasks without priority keywords are set to medium priority

**Examples:**
- `"Add urgent task submit report"` → Creates high priority task "submit report"
- `"Remind me to call mom later"` → Creates low priority task "call mom"
- `"Create task buy groceries"` → Creates medium priority task "buy groceries"

### 🎯 Natural Language Date & Time Detection

The system automatically detects dates and times from natural speech and sets task deadlines accordingly:

#### 📅 Date Detection
- **Relative dates**: today, tomorrow, next Friday, this weekend, in 3 days, next week
- **Specific days**: Monday, Tuesday, etc. (defaults to next occurrence), abbreviated forms (Mon, Tue, Wed, etc.)
- **Time periods**: this weekend, next week, in two weeks, end of the week, beginning of next week
- **Natural phrases**: by the end of the week, day after tomorrow

#### 🕒 Time Detection
- **12-hour format**: 5 PM, 2:30 PM, 9 AM, 11:30 AM
- **24-hour format**: 15:30, 09:00, 23:45
- **Natural language**: noon, midnight, morning, afternoon, evening, night
- **Meal times**: breakfast time, lunch time, dinner time, bedtime
- **Relative times**: half past 3, quarter past 2, quarter to 5, 3 o'clock

#### ✨ Smart Combination Examples
- `"Call John tomorrow at 5 PM"` → Task: "Call John", Due: Tomorrow 5:00 PM
- `"Meeting with client Friday at 2:30"` → Task: "Meeting with client", Due: Friday 2:30 PM
- `"Submit report by Monday noon"` → Task: "Submit report", Due: Monday 12:00 PM
- `"Doctor appointment next week at 3 PM"` → Task: "Doctor appointment", Due: Next week 3:00 PM
- `"Urgent call client tomorrow at 8 AM"` → High priority task "Call client", Due: Tomorrow 8:00 AM
- `"Buy groceries later this evening"` → Low priority task "Buy groceries", Due: Today 6:00 PM
- `"Add task call mom at half past 7"` → Task: "Call mom", Due: Today 7:30 PM
- `"Remind me to pay bills by end of week"` → Task: "Pay bills", Due: Friday 11:59 PM
- `"Schedule dentist appointment next Tuesday at quarter past 3"` → Task: "Dentist appointment", Due: Next Tuesday 3:15 PM
- `"I need to finish project by beginning of next week"` → Task: "Finish project", Due: Next Monday 11:59 PM

#### 🧠 Smart Text Processing
- **Automatic extraction**: The system intelligently removes date/time/priority keywords from the task name
- **Clean task names**: "Call John tomorrow at 5 PM" becomes task "Call John" with deadline
- **Priority preservation**: Keywords like "urgent" set priority but don't clutter the task name
- **Confidence scoring**: High confidence for exact matches, medium for inferred times/dates

### Examples

```
🎤 "Add task buy groceries"
✅ Creates new task "buy groceries" with medium priority

🎤 "Create urgent task submit report"
✅ Creates new task "submit report" with high priority

🎤 "Remind me to call mom later"
✅ Creates new task "call mom" with low priority

🎤 "Add task call John tomorrow at 5 PM"
✅ Creates new task "call John" due tomorrow at 5:00 PM

🎤 "Meeting with client Friday at 2:30"
✅ Creates new task "meeting with client" due Friday at 2:30 PM

🎤 "Submit report by Monday noon"
✅ Creates new task "submit report" due Monday at 12:00 PM

🎤 "Doctor appointment next week at 3 PM"
✅ Creates new task "doctor appointment" due next week at 3:00 PM

🎤 "I need to clean the house"
✅ Creates new task "clean the house" with medium priority

🎤 "Mark grocery shopping as done"
✅ Finds and completes "Grocery Shopping" task

🎤 "Delete the meeting task"  
🗑️ Finds and deletes "Team Meeting" task

🎤 "Show me what I need to do today"
📋 Lists today's tasks with completion status

🎤 "Complete homework"
✅ Finds and completes "Math Homework" task
```

### Tips for Better Recognition

- **Speak clearly** at a normal pace
- **Use quiet environment** for better accuracy
- **Use exact or similar task names** for best results
- **Try different phrasings** if a command doesn't work
- **Check the notification** for command confirmation

### Browser Compatibility

Voice commands require a modern browser with Web Speech API support:
- ✅ Chrome/Edge (recommended)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (with permissions)
- ❌ Older browsers may not support voice commands
