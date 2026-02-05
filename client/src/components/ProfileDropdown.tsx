import { useState } from 'react';
import { Settings, LogOut, Shield, Crown, Zap, User as UserIcon } from 'lucide-react';
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
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 transition-all hover:bg-muted">
            <Avatar className="h-8 w-8 border border-border/10">
              <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-xl border border-border/40 p-1.5 shadow-xl bg-popover/95" align="end">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border/10">
                   <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
                   <AvatarFallback className="bg-primary text-primary-foreground font-bold">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{(user as any)?.email || 'Personal Account'}</p>
                </div>
              </div>
              <div className="flex gap-2 px-2.5 py-1.5 rounded-lg bg-primary/5 border border-primary/10 items-center">
                 <Zap className="w-3 h-3 text-primary" />
                 <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Pro Account</span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-1" />
          
          <div className="p-1">
            <DropdownMenuItem onClick={() => setShowEditProfile(true)} className="rounded-lg gap-3 py-2 px-3 focus:bg-primary/5 focus:text-primary transition-all cursor-pointer">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-lg gap-3 py-2 px-3 opacity-50 cursor-not-allowed">
               <Shield className="h-4 w-4 text-muted-foreground" />
               <span className="text-sm font-medium">Security</span>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator className="mx-1" />
          
          <div className="p-1">
            <DropdownMenuItem onClick={handleLogout} className="rounded-lg gap-3 py-2 px-3 text-rose-500 focus:bg-rose-500/5 focus:text-rose-500 transition-all cursor-pointer">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign out</span>
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