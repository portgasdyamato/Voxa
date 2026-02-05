import { useState } from 'react';
import { User, Settings, LogOut, Edit, Sparkles, Shield } from 'lucide-react';
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
import { motion } from 'framer-motion';

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
    : (user as any)?.firstName || (user as any)?.email || 'User';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-11 w-11 rounded-2xl p-0 hover:bg-primary/10 transition-colors group">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100" />
            <Avatar className="h-11 w-11 rounded-2xl border-2 border-primary/20 bg-background group-hover:border-primary transition-all">
              <AvatarImage src={(user as any)?.profileImageUrl || ''} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-gradient-to-tr from-primary to-accent-500 text-white font-black">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 rounded-[1.5rem] border-2 p-2 shadow-2xl backdrop-blur-2xl" align="end">
          <DropdownMenuLabel className="font-normal p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-base font-black leading-none tracking-tight">
                  {displayName}
                </p>
                <div className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase">Plus</div>
              </div>
              {(user as any)?.email && (
                <p className="text-xs font-medium text-muted-foreground/70 truncate">
                  {(user as any).email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="mx-2 opacity-50" />
          <div className="p-1 space-y-1">
            <DropdownMenuItem onClick={() => setShowEditProfile(true)} className="rounded-xl gap-3 p-3 font-bold focus:bg-primary/10 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                <Edit className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span>Account Settings</span>
                <span className="text-[10px] text-muted-foreground font-medium">Update your profile & preferences</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-xl gap-3 p-3 font-bold focus:bg-indigo-500/10 transition-colors cursor-not-allowed opacity-50">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/5 flex items-center justify-center">
                 <Shield className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="flex flex-col">
                <span>Security</span>
                <span className="text-[10px] text-muted-foreground font-medium">Password & Multi-factor auth</span>
              </div>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator className="mx-2 opacity-50" />
          
          <div className="p-1">
            <DropdownMenuItem onClick={handleLogout} className="rounded-xl gap-3 p-3 font-bold text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-rose-500/5 flex items-center justify-center">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Sign Out</span>
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