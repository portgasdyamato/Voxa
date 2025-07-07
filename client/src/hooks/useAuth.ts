import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function useAuth() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: any;
  }>({ isAuthenticated: false, user: null });

  useEffect(() => {
    // Check URL parameters for login success
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login');
    const userName = urlParams.get('user');
    
    if (loginSuccess === 'success' && userName) {
      setAuthState({
        isAuthenticated: true,
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: decodeURIComponent(userName),
          lastName: '',
          isAuthenticated: true
        }
      });
    }
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: false, // Disable for now since we're using URL params
  });

  return {
    user: authState.user,
    isLoading: false,
    isAuthenticated: authState.isAuthenticated,
  };
}
