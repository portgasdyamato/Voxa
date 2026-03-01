import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Upload, Link, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EditProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfile({ open, onOpenChange }: EditProfileProps) {
  const { user, updateProfile: updateUserProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState((user as any)?.firstName || '');
  const [lastName, setLastName] = useState((user as any)?.lastName || '');
  const [profileImageUrl, setProfileImageUrl] = useState((user as any)?.profileImageUrl || '');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 2MB.',
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
      toast({ title: 'Profile updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Update failed',
        description: 'Something went wrong while saving your profile.',
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
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden glass border-white/5 shadow-3xl rounded-[2.5rem]">
        <DialogHeader className="p-10 pb-6 border-b border-white/5 relative bg-muted/20">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
             <User className="w-24 h-24" />
          </div>
          <DialogTitle className="text-3xl font-black tracking-tighter text-gradient italic">IDENTITY CONFIG</DialogTitle>
          <DialogDescription className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 mt-2">
            Subject profile and archival parameters
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex flex-col items-center gap-8">
              <div className="relative group">
                <Avatar className="h-32 w-32 rounded-[2.5rem] border-4 border-white/5 shadow-2xl">
                  <AvatarImage src={profileImageUrl || (user as any)?.profileImageUrl || ''} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black italic">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-2xl border-2 border-background flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </button>
              </div>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              
              <div className="flex gap-4">
                <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest border border-white/5 bg-muted/20 hover:bg-white/5">
                  <Upload className="w-3.5 h-3.5 mr-2" /> UPLOAD RAW
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput(!showUrlInput)} className="rounded-xl h-10 px-6 font-black text-[10px] uppercase tracking-widest border border-white/5 bg-muted/20 hover:bg-white/5">
                  <Link className="w-3.5 h-3.5 mr-2" /> EXTERNAL URI
                </Button>
              </div>
              
              <AnimatePresence>
                {showUrlInput && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full">
                    <Input
                      placeholder="https://identity.nexus/raw_buffer_01.jpg"
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      className="h-12 rounded-xl border-white/5 bg-muted/30 text-sm font-medium italic"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 italic">Identity Index (First Name)</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-14 rounded-xl border-white/5 bg-muted/30 text-base font-black italic tracking-tight"
                  required
                />
              </div>
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 italic">Identity Index (Last Name)</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-14 rounded-xl border-white/5 bg-muted/30 text-base font-black italic tracking-tight"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 px-1 italic">Point of Contact (Email)</Label>
              <Input value={(user as any)?.email || ''} disabled className="h-14 rounded-xl border-white/5 bg-muted-foreground/5 text-muted-foreground/40 text-sm font-black italic tracking-tight" />
            </div>
          </div>

          <div className="p-8 bg-muted/20 border-t border-white/5 flex gap-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 hover:bg-white/5">
              Abort
            </Button>
            <Button type="submit" disabled={updateProfile.isPending} className="flex-[2] h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] gradient-primary shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all">
              {updateProfile.isPending ? 'SYNCHRONIZING...' : 'COMMIT CHANGES'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}