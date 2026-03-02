import { useState } from 'react';
import { Settings, LogOut, Crown, User as UserIcon, Moon, Sun, Monitor, Bell, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EditProfile } from './EditProfile';
import { cn } from '@/lib/utils';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const handleLogout = () => {
    logout();
  };

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      
      if (permission === 'granted') {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification('VoXa Notifications Active', {
            body: 'You will now receive task reminders on your device!',
            icon: '/logo.png',
            badge: '/logo.png',
            vibrate: [100, 50, 100],
          } as any);
        }
      }
    }
  };

  const userInitials = (user as any)?.firstName && (user as any)?.lastName 
    ? `${(user as any).firstName[0]}${(user as any).lastName[0]}` 
    : (user as any)?.email?.[0]?.toUpperCase() || 'U';

  const displayName = (user as any)?.firstName && (user as any)?.lastName
    ? `${(user as any).firstName} ${(user as any).lastName}`
    : (user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'User';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 transition-all hover:bg-muted/40 border-border/10">
            <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-lg shadow-primary/5">
              <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-black">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          <DropdownMenuLabel className="font-normal px-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-white/[0.1] flex-shrink-0">
                 <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
                 <AvatarFallback className="bg-primary text-white text-sm font-black">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-white/30 truncate">{(user as any)?.email || 'Personal Account'}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-2 opacity-5" />
          
          <div className="p-1 space-y-0.5">
            <DropdownMenuItem 
              onClick={() => setShowEditProfile(true)} 
              className="rounded-xl gap-3 py-2.5 px-3 focus:bg-white/[0.06] transition-all cursor-pointer group"
            >
              <Settings className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
              <span className="text-sm font-semibold text-white/60 group-hover:text-white">Account settings</span>
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl gap-3 py-2.5 px-3 focus:bg-white/[0.06] transition-all cursor-pointer group data-[state=open]:bg-white/[0.06]">
                <Moon className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold text-white/60 group-hover:text-white">Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent side="left" className="border-white/[0.08] bg-[#0d1117]/95 backdrop-blur-3xl shadow-[0_16px_60px_rgba(0,0,0,0.7)] p-1.5 rounded-2xl w-40" sideOffset={8}>
                  <DropdownMenuItem onClick={() => setTheme('light')} className="rounded-xl font-bold gap-3 py-2.5 focus:bg-amber-500/10 focus:text-amber-500 transition-colors">
                    <Sun className="h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')} className="rounded-xl font-bold gap-3 py-2.5 focus:bg-indigo-500/10 focus:text-indigo-500 transition-colors">
                    <Moon className="h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')} className="rounded-xl font-bold gap-3 py-2.5 focus:bg-primary/10 transition-colors">
                    <Monitor className="h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="rounded-xl gap-3 py-2.5 px-3 focus:bg-white/[0.06] transition-all cursor-pointer group data-[state=open]:bg-white/[0.06]">
                <Bell className="h-4 w-4 text-white/30 group-hover:text-white transition-colors" />
                <span className="text-sm font-semibold text-white/60 group-hover:text-white">Notifications</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent side="left" className="border-white/[0.08] bg-[#0d1117]/95 backdrop-blur-3xl shadow-[0_16px_60px_rgba(0,0,0,0.7)] p-1.5 rounded-2xl w-56" sideOffset={8}>
                  <div className="px-3 py-2 mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Status: {notifPermission}</p>
                  </div>
                  <DropdownMenuItem 
                    onClick={handleRequestNotifications} 
                    className="rounded-xl font-bold gap-3 py-2.5 focus:bg-primary/10 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      {notifPermission === 'granted' ? <Check className="h-4 w-4 text-primary" /> : <Bell className="h-4 w-4 text-primary" />}
                    </div>
                    <span>{notifPermission === 'granted' ? 'Send Test' : 'Enable Device Push'}</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </div>
          
          <DropdownMenuSeparator className="mx-2 opacity-5" />
          
          <div className="p-1">
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="rounded-xl gap-3 py-2.5 px-3 text-rose-400 focus:bg-rose-500/10 focus:text-rose-400 transition-all cursor-pointer group"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-semibold">Sign out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProfile 
        open={showEditProfile} 
        onOpenChange={setShowEditProfile}
      />
    </>
  );
}