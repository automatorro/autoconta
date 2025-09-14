import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../integrations/supabase/client';

export const useBusinessSetup = () => {
  const [isBusinessSetupComplete, setIsBusinessSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkBusinessSetup = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
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
        console.error('Error checking business setup:', error);
        setIsBusinessSetupComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkBusinessSetup();
  }, [user]);

  return {
    isBusinessSetupComplete,
    loading,
    refetch: async () => {
      setLoading(true);
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('setup_completed')
            .eq('id', user.id)
            .single();

          if (!error) {
            setIsBusinessSetupComplete(data?.setup_completed || false);
          }
        } catch (error) {
          console.error('Error refetching business setup:', error);
        }
      }
      setLoading(false);
    }
  };
};