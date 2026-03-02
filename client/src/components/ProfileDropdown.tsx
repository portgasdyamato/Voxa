import { useState } from 'react';
import { Settings, LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EditProfile } from './EditProfile';
import { cn } from '@/lib/utils';

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = () => {
    logout();
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
        <DropdownMenuContent className="w-[calc(100vw-32px)] sm:w-64 max-w-[280px] bg-popover text-popover-foreground border-border shadow-2xl" align="end" sideOffset={8}>
          <DropdownMenuLabel className="font-normal px-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border flex-shrink-0">
                 <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
                 <AvatarFallback className="bg-primary text-primary-foreground text-sm font-black">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-bold truncate">{displayName}</p>
                <p className="text-[11px] opacity-40 truncate">{(user as any)?.email || 'Personal Account'}</p>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-2 opacity-10" />
          
          <div className="p-1 space-y-0.5">
            <DropdownMenuItem 
              onClick={() => setShowEditProfile(true)} 
              className="rounded-xl gap-3 py-2.5 px-3 focus:bg-accent focus:text-accent-foreground transition-all cursor-pointer group"
            >
              <Settings className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm font-semibold opacity-70 group-hover:opacity-100">Account settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="mx-2 opacity-10" />
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest opacity-20 px-3 py-2">Appearance</DropdownMenuLabel>
            
            <div className="grid grid-cols-3 gap-1 p-1">
              {[
                { id: 'light', icon: Sun, label: 'Light' },
                { id: 'dark', icon: Moon, label: 'Dark' },
                { id: 'system', icon: Monitor, label: 'System' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 py-2 rounded-lg transition-all",
                    theme === t.id 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-foreground/40 hover:text-foreground hover:bg-muted border border-transparent"
                  )}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="text-[9px] font-bold uppercase tracking-tighter">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <DropdownMenuSeparator className="mx-2 opacity-10" />
          
          <div className="p-1">
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="rounded-xl gap-3 py-2.5 px-3 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-all cursor-pointer group"
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