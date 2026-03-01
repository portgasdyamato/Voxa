import { useState } from 'react';
import { Settings, LogOut, Crown, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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