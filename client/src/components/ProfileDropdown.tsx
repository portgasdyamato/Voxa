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
          <Button variant="ghost" className="relative h-10 w-10 rounded-xl p-0 transition-all hover:bg-muted/40 border-border/10">
            <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-lg shadow-primary/5">
              <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-black">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 rounded-[2rem] glass border-white/5 p-2 shadow-3xl bg-popover/80" align="end">
          <DropdownMenuLabel className="font-normal p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                   <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
                   <AvatarFallback className="bg-primary text-primary-foreground font-black">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-base font-black tracking-tight truncate italic">{displayName}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 truncate">{(user as any)?.email || 'Personal Account'}</p>
                </div>
              </div>
              <div className="flex gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center">
                 <Crown className="w-3.5 h-3.5 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Pro Membership</span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-2 opacity-5" />
          
          <div className="p-2 space-y-1">
            <DropdownMenuItem 
              onClick={() => setShowEditProfile(true)} 
              className="rounded-xl gap-3 py-3 px-4 focus:bg-primary/10 transition-all cursor-pointer group"
            >
              <Settings className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:text-primary">Account Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-xl gap-3 py-3 px-4 opacity-30 cursor-not-allowed">
               <Shield className="h-4 w-4 text-muted-foreground/40" />
               <span className="text-[10px] font-black uppercase tracking-widest italic">Privacy Shield</span>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator className="mx-2 opacity-5" />
          
          <div className="p-2">
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="rounded-xl gap-3 py-3 px-4 text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-all cursor-pointer group"
            >
              <LogOut className="h-4 w-4 text-rose-500/40 group-hover:text-rose-500 transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Sign Out</span>
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