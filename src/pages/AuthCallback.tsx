import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { authUser } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(true);
  
  // Initialize auth hook to ensure session is processed
  useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...');
        
        // Verifică dacă există parametri de eroare în URL
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          console.error('❌ OAuth Error:', error, errorDescription);
          toast({
            title: "Eroare autentificare",
            description: errorDescription || "A apărut o eroare în timpul autentificării.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Verifică sesiunea curentă din Supabase
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          navigate('/auth');
          return;
        }

        if (session?.user) {
          console.log('✅ User authenticated successfully:', session.user.email);
          
          // Așteaptă puțin pentru ca useAuth să proceseze sesiunea
          setTimeout(() => {
            toast({
              title: "Autentificare reușită",
              description: "Bun venit în AutoConta!",
            });
            navigate('/dashboard');
          }, 500);
        } else {
          console.log('❌ No session found, redirecting to auth');
          navigate('/auth');
        }
      } catch (error) {
        console.error('❌ Error in auth callback:', error);
        toast({
          title: "Eroare",
          description: "A apărut o eroare în timpul procesării autentificării.",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setIsProcessing(false);
      }
    };

    // Procesează callback-ul după o scurtă întârziere
    const timer = setTimeout(handleAuthCallback, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se procesează autentificarea...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecționare...</p>
      </div>
    </div>
  );
};

export default AuthCallback;