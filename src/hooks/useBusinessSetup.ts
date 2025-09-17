import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BusinessSetupStatus {
  isBusinessSetupComplete: boolean;
  isLoading: boolean;
  checkBusinessSetup: () => Promise<void>;
}

export const useBusinessSetup = (): BusinessSetupStatus => {
  const { user } = useAuth();
  const [isBusinessSetupComplete, setIsBusinessSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkBusinessSetup = async () => {
    if (!user) {
      setIsBusinessSetupComplete(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('setup_completed')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking business setup:', error);
        setIsBusinessSetupComplete(false);
      } else {
        setIsBusinessSetupComplete(data?.setup_completed || false);
      }
    } catch (error) {
      console.error('Error in checkBusinessSetup:', error);
      setIsBusinessSetupComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBusinessSetup();
  }, [user]);

  return {
    isBusinessSetupComplete,
    isLoading,
    checkBusinessSetup
  };
};