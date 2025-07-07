import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: any;
    isLoading: boolean;
  }>({ isAuthenticated: false, user: null, isLoading: true });

  useEffect(() => {
    // Check URL parameters for login success on any page
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const userName = urlParams.get('user');
    
    if (loginSuccess === 'success' && userName) {
      const user = {
        id: 1,
        email: decodeURIComponent(userName).toLowerCase().replace(/\s+/g, '') + '@example.com',
        firstName: decodeURIComponent(userName),
        lastName: '',
        isAuthenticated: true
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('voxa_user', JSON.stringify(user));
      
      setAuthState({
        isAuthenticated: true,
        user: user,
        isLoading: false
      });
      
      // Clean up URL parameters after setting auth state
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } else {
      // Check localStorage for existing authentication
      try {
        const storedUser = localStorage.getItem('voxa_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setAuthState({
            isAuthenticated: true,
            user: user,
            isLoading: false
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('voxa_user');
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    }
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
  };
}
