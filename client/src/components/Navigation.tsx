import { useAuth } from '@/hooks/useAuth';
import { Mic, Home, BarChart3 } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { ThemeToggle } from './ThemeToggle';

interface NavigationProps {
  activeTab: 'home' | 'stats';
  onTabChange: (tab: 'home' | 'stats') => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return '?';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm shadow-sm border-b border-blue-100 dark:border-dark-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="VoXa Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-4xl font-semibold font-serif text-gray-800 dark:text-dark-text">VoXa</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Tab Navigation */}
              <div className="hidden sm:flex bg-white/60 dark:bg-dark-card/60 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => onTabChange('home')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    activeTab === 'home'
                      ? 'text-blue-600 bg-white dark:bg-dark-card shadow-sm'
                      : 'text-gray-500 dark:text-dark-muted hover:text-blue-600'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => onTabChange('stats')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    activeTab === 'stats'
                      ? 'text-blue-600 bg-white dark:bg-dark-card shadow-sm'
                      : 'text-gray-500 dark:text-dark-muted hover:text-blue-600'
                  }`}
                >
                  Stats
                </button>
              </div>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Profile */}
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-dark-surface/90 backdrop-blur-sm border-t border-blue-100 dark:border-dark-border z-40">
        <div className="grid grid-cols-2 h-16">
          <button
            onClick={() => onTabChange('home')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'home'
                ? 'text-blue-600 bg-blue-50 dark:bg-dark-card'
                : 'text-gray-500 dark:text-dark-muted'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => onTabChange('stats')}
            className={`flex flex-col items-center justify-center space-y-1 ${
              activeTab === 'stats'
                ? 'text-blue-600 bg-blue-50 dark:bg-dark-card'
                : 'text-gray-500 dark:text-dark-muted'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-medium">Stats</span>
          </button>
        </div>
      </div>
    </>
  );
}
