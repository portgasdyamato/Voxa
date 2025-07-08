# VoXa - Voice-Powered Task Manager

![VoXa Logo](client/public/logo.png)

VoXa is a modern, intelligent task management application that combines the power of voice commands with a beautiful, intuitive interface. Built with React, TypeScript, and Node.js, VoXa helps you manage your tasks efficiently through both traditional interactions and cutting-edge voice control.

## 🚀 Live Demo

**Production URL**: [https://voxa-cl66cbsp9-portgasdyamatos-projects.vercel.app](https://voxa-cl66cbsp9-portgasdyamatos-projects.vercel.app)

Try the fully functional app deployed on Vercel with PostgreSQL database backend!

## ✨ Features

### 🎤 Voice Commands
- **Natural Language Processing**: Speak naturally to create, manage, and organize tasks
- **Voice Task Creation**: "Add task to buy groceries" or "Create high priority task for meeting"
- **Task Management**: "Mark laundry as done" or "Delete old project task"
- **Smart Recognition**: Intelligent parsing of task priorities, deadlines, and categories
- **Keyboard Shortcut**: Press `Ctrl+K` to activate voice commands quickly

### 📱 Task Management
- **Create & Edit Tasks**: Add tasks with titles, descriptions, priorities, and deadlines
- **Smart Categorization**: Organize tasks with customizable categories (Work, Personal, Shopping, etc.)
- **Priority Levels**: Set tasks as High, Medium, or Low priority
- **Due Date Tracking**: Set and track task deadlines with smart filtering
- **Recurring Tasks**: Set up daily, weekly, or monthly recurring tasks
- **Task Completion**: Mark tasks as complete with visual feedback

### 🔔 Smart Notifications
- **Deadline Reminders**: Get notified before task deadlines
- **Multiple Reminder Types**: Morning reminders, manual time settings, or default notifications
- **Browser Notifications**: Native browser notification support
- **Customizable Alerts**: Set specific reminder times for important tasks

### 📊 Analytics & Insights
- **Real-time Statistics**: Track total, completed, and pending tasks
- **Completion Rates**: Monitor your productivity with completion percentages
- **Visual Charts**: Interactive charts showing task completion trends
- **Streak Tracking**: See your current and longest completion streaks
- **Period Analysis**: View stats for week, month, or quarter periods
- **Priority Distribution**: Understand your task priority patterns

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Toggle between dark and light modes
- **Glass Effect Design**: Modern glassmorphism UI with smooth animations
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile
- **Intuitive Navigation**: Easy-to-use interface with clear visual hierarchy
- **Real-time Updates**: Instant updates across all components

### 🔐 Authentication & Data
- **Secure Authentication**: Google OAuth integration for secure login
- **User Profiles**: Personalized experience with profile management and real user email display
- **Data Persistence**: All tasks and settings are safely stored
- **Multi-user Support**: Each user has their own private task space
- **Demo Mode**: Try the app without signing up using the demo account

### 🛠️ Recent Updates & Fixes
- **Duplicate Categories Fixed**: Resolved issue with duplicate category display
- **User Authentication**: Improved OAuth flow with proper email handling
- **Database Optimization**: Enhanced user detection and data deduplication
- **Performance**: Optimized API endpoints and client-side rendering
- **UI/UX**: Refined category filtering and task management interface

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Google OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voxa.git
   cd voxa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/voxa
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

6. **Start the server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:5000`

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **React Query**: Server state management
- **Recharts**: Interactive charts and visualizations
- **Radix UI**: Accessible UI components
- **Lucide React**: Beautiful icons

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe backend development
- **Drizzle ORM**: Type-safe database interactions
- **PostgreSQL**: Relational database
- **Google OAuth**: Authentication provider

### Voice Technology
- **Web Speech API**: Browser-based speech recognition
- **Natural Language Processing**: Custom command parsing
- **Voice Command Recognition**: Intelligent task management through voice

## 📱 Usage

### Voice Commands Examples

**Creating Tasks:**
- "Add task to buy groceries"
- "Create high priority task for team meeting"
- "Remind me to call mom tomorrow"
- "Schedule dentist appointment"

**Managing Tasks:**
- "Mark laundry as done"
- "Complete project presentation"
- "Delete old meeting notes"
- "Set shopping list as pending"

**Task Queries:**
- "Show me today's tasks"
- "List all pending tasks"
- "Show completed tasks"

### Keyboard Shortcuts
- `Ctrl+K` (or `Cmd+K` on Mac): Activate voice commands
- Theme toggle available in the navigation

### Task Filtering
- Filter by categories (Work, Personal, Shopping, Health, Learning)
- Filter by deadlines (Today, Tomorrow, This Week, Overdue)
- Search tasks by title or description
- Toggle between today's tasks and all tasks

## 🔧 Configuration

### Default Categories
VoXa comes with pre-configured categories:
- **Work** (Blue)
- **Personal** (Green)
- **Shopping** (Yellow)
- **Health** (Red)
- **Learning** (Purple)

You can customize these categories or add new ones through the category manager.

### Notification Settings
- **Default**: Standard notification timing
- **Morning**: Reminders at 9:00 AM
- **Manual**: Set specific reminder times

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Database operations
npm run db:push    # Push schema changes
npm run db:studio  # Open database studio
```

## 🐛 Troubleshooting

### Common Issues

**Voice commands not working:**
- Ensure you're using a supported browser (Chrome, Edge, Safari)
- Check microphone permissions
- Verify HTTPS connection (required for Web Speech API)

**Authentication issues:**
- Verify Google OAuth credentials
- Check redirect URLs in Google Console
- Ensure session secret is set

**Database connection:**
- Verify PostgreSQL is running
- Check database URL format
- Ensure database exists and is accessible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for accessible task management
- Special thanks to the open-source community

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**VoXa** - Transforming task management through the power of voice! 🎤✨
