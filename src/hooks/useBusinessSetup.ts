import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';

interface BusinessSetupStatus {
  isBusinessSetupComplete: boolean;
  isLoading: boolean;
  checkBusinessSetup: () => Promise<void>;
}

export const useBusinessSetup = (): BusinessSetupStatus => {
  const { authUser } = useAppStore();
  const [isBusinessSetupComplete, setIsBusinessSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkBusinessSetup = async () => {
    if (!authUser) {
      setIsBusinessSetupComplete(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('setup_completed')
        .eq('user_id', authUser.id)
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
  }, [authUser]);

  return {
    isBusinessSetupComplete,
    isLoading,
    checkBusinessSetup
  };
};