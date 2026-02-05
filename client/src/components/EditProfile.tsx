import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Upload, Link, User, ShieldCheck, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EditProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfile({ open, onOpenChange }: EditProfileProps) {
  const { user, updateProfile: updateUserProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState((user as any)?.firstName || '');
  const [lastName, setLastName] = useState((user as any)?.lastName || '');
  const [profileImageUrl, setProfileImageUrl] = useState((user as any)?.profileImageUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({
          title: 'Payload exceeding limit',
          description: 'Please select an image smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; profileImageUrl: string }) => {
      return await updateUserProfile(data);
    },
    onSuccess: () => {
      toast({
        title: 'System Synchronized',
        description: 'Your profile parameters have been updated.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Sync Failed',
        description: 'Failed to update system parameters. Please retry.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profileImageUrl: profileImageUrl.trim(),
    });
  };

  const userInitials = firstName && lastName 
    ? `${firstName[0]}${lastName[0]}` 
    : (user as any)?.email?.[0]?.toUpperCase() || 'U';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-[3rem] border-2 border-border/40 bg-card/95 backdrop-blur-3xl shadow-3xl">
        <DialogHeader className="p-10 pb-6 bg-primary/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[60px] -ml-16 -mt-16" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
               <ShieldCheck className="w-9 h-9" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tight">Identity Config</DialogTitle>
              <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Configure account parameters</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="px-10 py-8 space-y-8">
          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-background shadow-2xl transition-all group-hover:scale-105 duration-500">
                <AvatarImage src={profileImageUrl || (user as any)?.profileImageUrl || ''} alt="Profile" className="object-cover" />
                <AvatarFallback className="bg-gradient-to-tr from-primary to-indigo-600 text-white text-3xl font-black uppercase">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-foreground text-background shadow-xl border-4 border-background flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
              </motion.button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 border-2 border-border/50"
              >
                <Upload className="h-3.5 w-3.5 mr-2" /> Upload Avatar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className={cn("h-11 rounded-xl font-black uppercase tracking-widest text-[10px] px-6 border-2 transition-all", showUrlInput ? "border-primary text-primary bg-primary/5" : "border-border/50")}
              >
                <Link className="h-3.5 w-3.5 mr-2" /> Neural Link
              </Button>
            </div>
            
            <AnimatePresence>
              {showUrlInput && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full space-y-3"
                >
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Avatar Source URL</Label>
                  <Input
                    type="url"
                    placeholder="https://cloud.voxa.app/u/avatar.jpg"
                    value={profileImageUrl}
                    onChange={(e) => setProfileImageUrl(e.target.value)}
                    className="h-14 rounded-2xl border-2 bg-muted/30 focus-visible:ring-0 focus-visible:border-primary font-bold px-6"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">First ID</Label>
              <Input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-14 rounded-2xl border-2 bg-muted/30 focus-visible:ring-0 focus-visible:border-primary font-black px-6"
                required
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">Last ID</Label>
              <Input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-14 rounded-2xl border-2 bg-muted/30 focus-visible:ring-0 focus-visible:border-primary font-black px-6"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Communication Node
            </Label>
            <Input
              value={(user as any)?.email || ''}
              disabled
              className="h-14 rounded-2xl border-2 bg-muted/20 text-muted-foreground/60 font-bold px-6 border-dashed"
            />
          </div>

          <div className="flex gap-4 pt-4 pb-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={updateProfile.isPending}
              className="flex-1 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px]"
            >
              Abort
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="flex-[2] h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] bg-primary text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
            >
              {updateProfile.isPending ? 'Syncing...' : 'Commit Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}