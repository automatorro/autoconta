import { useState, useEffect } from 'react';
<<<<<<< HEAD
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
=======
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

>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
    checkBusinessSetup();
  }, [user]);

  return {
    isBusinessSetupComplete,
<<<<<<< HEAD
    isLoading,
    checkBusinessSetup
=======
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
>>>>>>> a89382dac9c985abfc81276cff3029fd57d4938a
  };
};