import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import type { User, Session } from '@supabase/supabase-js';
import { Company, Vehicle, Driver } from '@/types/accounting';
import { testSupabaseConnection } from '@/utils/testSupabase';

export function useAuth() {
  const { setUser, setSession, setCompany, setUserData, addVehicle, addDriver } = useAppStore();

  // Function to load user data from Supabase
  const loadUserData = async (userId: string) => {
    console.log('🔄 Loading user data for userId:', userId);
    try {
      // Load user profile - use any to bypass TypeScript restrictions
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles' as any)
        .select('*')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Profile data:', profile);
      console.log('❌ Profile error:', profileError);

      if (profile && (profile as any).setup_completed) {
        console.log('✅ Profile found and setup completed, loading company data...');
        // Create company object from profile
        const company: Company = {
          id: (profile as any).id,
          name: (profile as any).company_name || '',
          cif: (profile as any).cif || '',
          cnp: (profile as any).cnp || '',
          type: ((profile as any).company_type as 'PFA' | 'SRL') || 'PFA',
          vatPayer: (profile as any).vat_payer || false,
          vatIntraCommunity: (profile as any).vat_intra_community || '',
          address: {
            street: (profile as any).address_street || '',
            city: (profile as any).address_city || '',
            county: (profile as any).address_county || '',
            postalCode: (profile as any).address_postal_code || ''
          },
          contact: {
            phone: (profile as any).contact_phone || '',
            email: (profile as any).contact_email || ''
          },
          createdAt: (profile as any).created_at ? new Date((profile as any).created_at) : new Date(),
          updatedAt: (profile as any).updated_at ? new Date((profile as any).updated_at) : new Date()
        };
        console.log('🏢 Setting company:', company);
        setCompany(company);
        
        // Set user with profile data to persist setup_completed status
        const userData = {
          id: (profile as any).user_id,
          email: (profile as any).contact_email || '',
          setupCompleted: (profile as any).setup_completed || false,
          company: company,
          vehicles: [],
          drivers: []
        };
        console.log('👤 Setting user data:', userData);

        // Load vehicles - use any to bypass TypeScript restrictions
        const { data: vehicles } = await supabase
          .from('vehicles' as any)
          .select('*')
          .eq('user_id', userId);

        if (vehicles) {
          console.log('🚗 Loading vehicles data:', vehicles.length, 'vehicles found');
          vehicles.forEach((vehicle: any) => {
            const vehicleData: Vehicle = {
              id: vehicle.id,
              make: vehicle.make || '',
              model: vehicle.model || '',
              plateNumber: vehicle.license_plate || '',
              year: vehicle.year || 0,
              vin: vehicle.vin || '',
              documents: {
                itp: {
                  documentNumber: '',
                  issueDate: new Date(),
                  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                },
                rca: {
                  documentNumber: '',
                  issueDate: new Date(),
                  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                }
              },
              createdAt: vehicle.created_at ? new Date(vehicle.created_at) : new Date(),
              updatedAt: vehicle.updated_at ? new Date(vehicle.updated_at) : new Date()
            };
            addVehicle(vehicleData);
            userData.vehicles.push(vehicleData);
          });
        }

        // Load drivers - use any to bypass TypeScript restrictions
        const { data: drivers } = await supabase
          .from('drivers' as any)
          .select('*')
          .eq('user_id', userId);

        if (drivers) {
          console.log('👨‍✈️ Loading drivers data:', drivers.length, 'drivers found');
          drivers.forEach((driver: any) => {
            const driverData: Driver = {
              id: driver.id,
              name: driver.name || '',
              cnp: driver.cnp || '',
              licenseNumber: driver.license_number || '',
              certificates: {
                professionalAttestation: {
                  documentNumber: '',
                  issueDate: new Date(),
                  expiryDate: driver.license_expiry_date ? new Date(driver.license_expiry_date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                },
                medicalCertificate: {
                  documentNumber: '',
                  issueDate: new Date(),
                  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                }
              },
              vehicleIds: [],
              createdAt: driver.created_at ? new Date(driver.created_at) : new Date(),
              updatedAt: driver.updated_at ? new Date(driver.updated_at) : new Date()
            };
            addDriver(driverData);
            userData.drivers.push(driverData);
          });
        }
        
        // Finally set the complete user data with setup_completed status
        console.log('✅ Setting complete user data with setup status:', userData.setupCompleted);
        setUserData(userData);
      } else {
        console.log('⚠️ No profile found or setup not completed');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };

  useEffect(() => {
    // Test Supabase connection on initialization
    testSupabaseConnection();
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, 'User:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out, clearing all data');
          // Clear all cached data when user signs out
          setUser(null);
          setSession(null);
          setCompany(null);
          setUserData({
            id: '',
            email: '',
            setupCompleted: false,
            company: null,
            vehicles: [],
            drivers: []
          });
        } else if (event === 'SIGNED_IN' && session?.user) {
          console.log('🚀 User signed in, loading user data...');
          // Load user data when signed in
          await loadUserData(session.user.id);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Checking existing session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Load user data if session exists
      if (session?.user) {
        console.log('📥 Existing session found, loading user data...');
        await loadUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, loadUserData]);

  const signUp = async (email: string, password: string) => {
    // Use proper redirect URLs based on environment
    const isProduction = window.location.hostname === 'autoconta.lovable.app' || window.location.hostname.includes('.lovable.app');
    const isLocalhost = window.location.hostname === 'localhost';

    let redirectUrl = '/auth/callback';

    if (isProduction) {
      redirectUrl = `https://autoconta.lovable.app/auth/callback`;
    } else if (isLocalhost) {
      // Forțăm folosirea portului 8080 pentru dezvoltare locală
      redirectUrl = `http://localhost:8080/auth/callback`;
    } else {
      // Fallback pentru alte medii
      redirectUrl = `${window.location.origin}/auth/callback`;
    }

    console.log('📧 Email signup redirect URL:', redirectUrl);
    console.log('🌐 Current environment detection - isProduction:', isProduction, 'isLocalhost:', isLocalhost, 'hostname:', window.location.hostname, 'port:', window.location.port);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    console.log('📧 SignUp result - Error:', error);
    if (error) {
      console.error('❌ SignUp failed with error:', error.message, 'Code:', error.status);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Starting email/password sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('🔐 Sign in result - Data:', data, 'Error:', error);
    if (error) {
      console.error('❌ Sign in failed:', error.message, 'Status:', error.status);
    } else {
      console.log('✅ Sign in successful');
    }
    return { error };
  };

  const signInWithGoogle = async () => {
    // Use proper redirect URLs based on environment
    const isProduction = window.location.hostname === 'autoconta.lovable.app' || window.location.hostname.includes('.lovable.app');
    const isLocalhost = window.location.hostname === 'localhost';
    const isLocalDev = window.location.port === '8080' || window.location.hostname === 'localhost';

    let redirectUrl = '/auth/callback';

    if (isProduction) {
      redirectUrl = `https://autoconta.lovable.app/auth/callback`;
    } else if (isLocalhost || isLocalDev) {
      // Forțăm folosirea portului 8080 pentru dezvoltare locală
      redirectUrl = `http://localhost:8080/auth/callback`;
    } else {
      // Fallback pentru alte medii
      redirectUrl = `${window.location.origin}/auth/callback`;
    }

    console.log('🔗 Google OAuth redirect URL:', redirectUrl);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🌍 Current hostname:', window.location.hostname);
    console.log('🔧 Current port:', window.location.port);
    console.log('🌐 Environment detection - isProduction:', isProduction, 'isLocalhost:', isLocalhost, 'isLocalDev:', isLocalDev);

    if (isLocalhost || isLocalDev) {
      console.log('🧪 Running in local development environment on port 8080');
      console.log('⚠️  IMPORTANT: Make sure Google Cloud Console has http://localhost:8080 in Authorized JavaScript origins');
    } else if (isProduction) {
      console.log('🚀 Running in production environment');
    }

    console.log('🔗 Starting Google OAuth with redirectTo:', redirectUrl);
    console.log('🚨 If you get redirected to production instead of localhost, check Google Cloud Console configuration!');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false
      }
    });

    console.log('🔗 Google OAuth result - Data:', data, 'Error:', error);

    if (error) {
      console.error('❌ Google OAuth error:', error.message, 'Status:', error.status);
      console.error('❌ Full error object:', error);
    } else {
      console.log('✅ Google OAuth initiated successfully, redirecting...');
    }

    return { error };
  };

  const signOut = async () => {
    try {
      console.log('🔄 Starting sign out process...');
      
      // Apelăm signOut de la Supabase mai întâi
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        return { error };
      }
      
      console.log('✅ Successfully signed out from Supabase');
      
      // Forțăm curățarea stării locale după apelul signOut
      setUser(null);
      setSession(null);
      setCompany(null);
      setUserData({
        id: '',
        email: '',
        setupCompleted: false,
        company: null,
        vehicles: [],
        drivers: []
      });
      
      // Curățăm complet localStorage pentru a elimina orice sesiune persistentă
      // Curățăm starea persistentă din Zustand
      localStorage.removeItem('autoconta-storage');
      
      // Curățăm toate cheile Supabase (care încep cu 'sb-')
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          console.log('🧹 Removing Supabase key:', key);
          localStorage.removeItem(key);
        }
      });
      
      // Forțăm o reîncărcare completă a paginii pentru a asigura resetarea completă a stării
      // Folosim location.replace în loc de location.href pentru a preveni păstrarea în istoric
      window.location.replace('/');
      
      return { error: null };
    } catch (error) {
      console.error('❌ Error during signOut:', error);
      return { error: error as any };
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
}