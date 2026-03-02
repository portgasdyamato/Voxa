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
import { Camera, Upload, Link, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        toast({ title: 'Image too large', description: 'Please choose an image under 2MB.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => setProfileImageUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; profileImageUrl: string }) => {
      return await updateUserProfile(data);
    },
    onSuccess: () => {
      toast({ title: 'Profile saved!' });
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: 'Update failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0c10] shadow-[0_40px_80px_rgba(0,0,0,0.8)] max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.06] flex-shrink-0">
          <DialogTitle className="text-xl font-black text-white tracking-tight">Edit Profile</DialogTitle>
          <DialogDescription className="text-[11px] text-white/30 font-medium mt-0.5">
            Update your name and profile photo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-5 pb-5 border-b border-white/[0.06]">
              <div className="relative group">
                <Avatar className="h-24 w-24 rounded-2xl border-2 border-white/10 shadow-xl">
                  <AvatarImage src={profileImageUrl || (user as any)?.profileImageUrl || ''} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white text-2xl font-black rounded-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary text-white shadow-lg border-2 border-[#0a0c10] flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-[12px] font-bold text-white/40 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload photo
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl text-[12px] font-bold text-white/40 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all"
                >
                  <Link className="w-3.5 h-3.5" /> Use URL
                </button>
              </div>

              <AnimatePresence>
                {showUrlInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">First name</Label>
                <Input
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm font-semibold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Last name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-sm font-semibold"
                  required
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-white/30">Email</Label>
              <Input
                value={(user as any)?.email || ''}
                disabled
                className="h-11 rounded-xl border-white/[0.06] bg-white/[0.02] text-white/30 text-sm cursor-not-allowed"
              />
              <p className="text-[10px] text-white/20 px-1">Email cannot be changed here</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex-[2] h-11 rounded-xl font-black text-sm bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              {updateProfile.isPending ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Save changes
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}