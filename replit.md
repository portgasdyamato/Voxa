# Voice Task Manager

## Overview

Voice Task Manager is a fullstack web application that enables users to create, manage, and track tasks using voice input. The application features AI-powered voice recognition, task prioritization, and visual statistics, providing a modern and intuitive task management experience.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Design System**: Custom pastel color palette (light blue, lavender) with modern glass-morphism effects

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit Auth (OpenID Connect)
- **API Design**: RESTful endpoints with proper error handling

### Database Schema
- **Users**: Core user information (required for Replit Auth)
- **Tasks**: Task management with title, description, priority, completion status, and due dates
- **Sessions**: Session storage (required for Replit Auth)

## Key Components

### Voice Recognition System
- **Browser API**: Web Speech API (webkitSpeechRecognition/SpeechRecognition)
- **Language Support**: English (en-US) with configurable options
- **Real-time Processing**: Continuous listening with interim results support
- **Priority Detection**: Automatic priority assignment based on keyword analysis

### Task Management
- **Priority System**: Three-tier priority system (high, medium, low)
- **Smart Detection**: Keyword-based priority assignment from voice input
- **Status Tracking**: Boolean completion status with visual indicators
- **Date Management**: Due date support with time-based formatting

### Statistics and Analytics
- **Visual Charts**: Bar charts and pie charts using Recharts
- **Completion Metrics**: Track completed vs pending tasks
- **Priority Distribution**: Visual breakdown of task priorities
- **Time-based Views**: Daily, weekly, and monthly filtering capabilities

### User Interface
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Glass Morphism**: Modern UI with backdrop blur effects
- **Floating Action Button**: Prominent voice input trigger
- **Navigation**: Tab-based navigation between Home and Stats views

## Data Flow

1. **Voice Input**: User clicks floating microphone button
2. **Speech Recognition**: Browser API captures and transcribes speech
3. **Priority Detection**: Server-side algorithm analyzes keywords for priority
4. **Task Creation**: New task stored in PostgreSQL database
5. **Real-time Updates**: TanStack Query invalidates and refetches data
6. **UI Updates**: Components re-render with new task data

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Replit Auth system
- **UI Components**: Radix UI primitives
- **Charts**: Recharts for data visualization
- **ORM**: Drizzle for type-safe database operations

### Development Tools
- **Build Tool**: Vite for fast development and building
- **TypeScript**: Full type safety across frontend and backend
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite HMR for frontend development
- **Backend**: tsx for TypeScript execution in development
- **Database**: Drizzle migrations for schema management

### Production Build
- **Frontend**: Vite build output to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPL_ID

### Database Management
- **Migrations**: Drizzle-kit for schema versioning
- **Connection**: Neon serverless PostgreSQL with WebSocket support
- **Session Storage**: PostgreSQL-based session persistence

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Enhanced stats with real-time analytics, streak tracking, and period filtering
- July 05, 2025. Added profile management with edit functionality and dropdown navigation
- July 05, 2025. Implemented task search/filtering and completed full functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```