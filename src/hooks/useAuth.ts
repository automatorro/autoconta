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
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Use proper redirect URLs based on environment
    const isProduction = window.location.hostname === 'autoconta.lovable.app' || window.location.hostname.includes('.lovable.app');
    const isLocalhost = window.location.hostname === 'localhost';
    
    let redirectUrl = '/';
    
    if (isProduction) {
      redirectUrl = `${window.location.origin}/`;
    } else if (isLocalhost) {
      redirectUrl = `${window.location.origin}/`;
    }
    
    console.log('🔗 Google OAuth redirect URL:', redirectUrl);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🌍 Current hostname:', window.location.hostname);
    
    if (isLocalhost) {
      console.log('🧪 Running in local development environment');
    } else if (isProduction) {
      console.log('🚀 Running in production environment');
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false
      }
    });
    
    if (error) {
      console.error('❌ Google OAuth error:', error);
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('🔄 Starting sign out process...');
      
      // Sign out from Supabase first - this will trigger the auth state change
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        // Even if there's an error, clear local state
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
      } else {
        console.log('✅ Successfully signed out from Supabase');
      }
      
      return { error };
    } catch (error) {
      console.error('❌ Error during signOut:', error);
      // Clear local state even if there's an error
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