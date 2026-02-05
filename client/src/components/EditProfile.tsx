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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-border/40 shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-border/10">
          <DialogTitle className="text-xl font-bold">Edit Profile</DialogTitle>
          <DialogDescription className="text-sm">Manage your account information and avatar.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <Avatar className="h-24 w-24 rounded-full border-2 border-background shadow-md">
                  <AvatarImage src={profileImageUrl || (user as any)?.profileImageUrl || ''} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-foreground text-background shadow-lg border-2 border-background flex items-center justify-center transition-colors hover:bg-primary hover:text-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-lg h-9 px-4 font-bold text-xs uppercase tracking-wider">
                  Upload Image
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput(!showUrlInput)} className="rounded-lg h-9 px-4 font-bold text-xs uppercase tracking-wider">
                  Photo URL
                </Button>
              </div>
              
              <AnimatePresence>
                {showUrlInput && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="w-full">
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      className="h-10 rounded-xl border-border/50 bg-muted/20 text-sm font-medium"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-10 rounded-xl border-border/50 bg-muted/20 text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-10 rounded-xl border-border/50 bg-muted/20 text-sm font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60 px-0.5">Email</Label>
              <Input value={(user as any)?.email || ''} disabled className="h-10 rounded-xl border-border/50 bg-muted/10 text-muted-foreground/60 text-sm font-medium" />
            </div>
          </div>

          <div className="p-6 bg-muted/30 border-t border-border/40 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl h-10 font-bold">
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfile.isPending} className="flex-1 rounded-xl h-10 font-bold">
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}