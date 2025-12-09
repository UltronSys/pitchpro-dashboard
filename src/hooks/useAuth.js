import { useState, useEffect } from 'react';
import authService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user still has access
        try {
          const accessCheck = await authService.checkUserAccess(firebaseUser.email);
          if (accessCheck.status === "Success") {
            setUser(firebaseUser);
          } else {
            // User no longer has access, sign them out
            await authService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error("Access check failed:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};