import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
  }>({ isAuthenticated: false, user: null, isLoading: true });

  const queryClient = useQueryClient();

  // Check authentication status on mount
  useEffect(() => {
    // Check URL parameters for login success
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    
    if (loginSuccess === 'success') {
      // User just logged in successfully
      setAuthState({
        isAuthenticated: true,
        user: null, // Will be loaded from API
        isLoading: false
      });
      localStorage.setItem('voxa_authenticated', 'true');
      
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    } else {
      // Check localStorage for existing auth
      const isAuthenticated = localStorage.getItem('voxa_authenticated') === 'true';
      const storedUser = localStorage.getItem('voxa_user');
      
      if (isAuthenticated) {
        setAuthState({
          isAuthenticated: true,
          user: storedUser ? JSON.parse(storedUser) : null,
          isLoading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    }
  }, []);

  // Fetch user profile from API when authenticated
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    },
    enabled: authState.isAuthenticated, // Only fetch when authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update user state when profile data is loaded
  useEffect(() => {
    if (userProfile && authState.isAuthenticated) {
      const updatedUser = {
        ...userProfile,
        isAuthenticated: true
      };
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
      
      // Store in localStorage
      localStorage.setItem('voxa_user', JSON.stringify(updatedUser));
    }
  }, [userProfile, authState.isAuthenticated]);

  const logout = () => {
    localStorage.removeItem('voxa_user');
    localStorage.removeItem('voxa_authenticated');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false
    });
    queryClient.clear();
    window.location.href = '/';
  };

  const updateProfile = async (profileData: any) => {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const updatedUser = await response.json();
    
    // Update local state
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...updatedUser }
    }));
    
    // Update localStorage
    localStorage.setItem('voxa_user', JSON.stringify({ ...authState.user, ...updatedUser }));
    
    // Invalidate profile query to refetch
    queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    
    return updatedUser;
  };

  return {
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading || profileLoading,
    logout,
    updateProfile
  };
}
