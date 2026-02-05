import { useState } from 'react';
import { User, Settings, LogOut, Edit, Sparkles, Shield, Crown, Zap } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
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
    : (user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'Operator';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-14 w-14 rounded-2xl p-0 hover:bg-primary/5 transition-all group border-2 border-transparent hover:border-primary/20">
            <div className="absolute inset-x-0 bottom-[-8px] h-1 w-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all blur-sm" />
            <Avatar className="h-11 w-11 rounded-[1.2rem] border-2 border-border/80 bg-background group-hover:border-primary group-hover:scale-105 transition-all duration-300">
              <AvatarImage src={(user as any)?.profileImageUrl || ''} alt="Profile" className="object-cover" />
              <AvatarFallback className="bg-gradient-to-tr from-primary via-indigo-500 to-indigo-400 text-white font-black text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 rounded-[2.5rem] border-2 border-border/40 p-3 shadow-3xl backdrop-blur-3xl bg-popover/90" align="end">
          <DropdownMenuLabel className="font-normal p-6 pt-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-20 w-20 rounded-[2rem] border-4 border-background shadow-2xl">
                   <AvatarImage src={(user as any)?.profileImageUrl || ''} className="object-cover" />
                   <AvatarFallback className="bg-primary text-white text-2xl font-black">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 p-2 rounded-xl text-white shadow-xl shadow-amber-500/30 border-2 border-background">
                  <Crown className="w-4 h-4 fill-current" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black tracking-tight leading-none">{displayName}</p>
                <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">Master Operator</p>
              </div>
              <div className="flex gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/10 w-full justify-center items-center">
                 <Zap className="w-4 h-4 text-primary fill-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary">Neural Link Active</span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="mx-4 opacity-40" />
          
          <div className="p-2 space-y-1">
            <DropdownMenuItem onClick={() => setShowEditProfile(true)} className="rounded-2xl gap-4 p-4 font-black uppercase tracking-widest text-[10px] focus:bg-primary/10 focus:text-primary transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/20">
                <Settings className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span>Core Settings</span>
                <span className="text-[9px] text-muted-foreground font-bold lowercase tracking-normal">Modify account parameters</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-2xl gap-4 p-4 font-black uppercase tracking-widest text-[10px] focus:bg-indigo-500/10 transition-all cursor-not-allowed opacity-40">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/20">
                 <Shield className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span>Vault Access</span>
                <span className="text-[9px] text-muted-foreground font-bold lowercase tracking-normal">Biometric & system security</span>
              </div>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator className="mx-4 opacity-40" />
          
          <div className="p-2">
            <DropdownMenuItem onClick={handleLogout} className="rounded-2xl gap-4 p-4 font-black uppercase tracking-widest text-[10px] text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-rose-500/5 flex items-center justify-center border border-rose-500/20">
                <LogOut className="h-5 w-5" />
              </div>
              <span>Deactivate Session</span>
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