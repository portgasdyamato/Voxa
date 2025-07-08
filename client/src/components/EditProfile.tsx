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
import { Camera, Upload, Link } from 'lucide-react';

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

  // Convert file to base64 URL for preview
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
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
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileImageUrl || (user as any)?.profileImageUrl || ''} alt="Profile" />
                <AvatarFallback className="bg-blue-500 text-white text-xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Profile picture options */}
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Image</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="flex items-center space-x-2"
              >
                <Link className="h-4 w-4" />
                <span>Use URL</span>
              </Button>
            </div>
            
            {/* URL input (conditionally shown) */}
            {showUrlInput && (
              <div className="w-full space-y-2">
                <Label htmlFor="profileImageUrl">Profile Image URL</Label>
                <Input
                  id="profileImageUrl"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={(user as any)?.email || ''}
              disabled
              className="bg-gray-50 text-gray-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={updateProfile.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}