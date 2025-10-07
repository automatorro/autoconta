import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/useAppStore';
import type { User, Session } from '@supabase/supabase-js';
import { Company, Vehicle, Driver } from '@/types/accounting';


export function useAuth() {
  const { setUser, setSession, setCompany, setUserData, addVehicle, addDriver } = useAppStore();

  // Function to create a new user profile
  const createUserProfile = async (userId: string, email: string) => {
    console.log('🆕 Creating new user profile for userId:', userId, 'email:', email);
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          contact_email: email,
          setup_completed: false,
          vat_intra_community: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user profile:', createError);
        return null;
      }

      console.log('✅ User profile created successfully:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('❌ Exception creating user profile:', error);
      return null;
    }
  };

  // Function to load user data from Supabase
  const loadUserData = useCallback(async (userId: string, userEmail?: string) => {
    console.log('🔄 Loading user data for userId:', userId);
    try {
      // Load user profile (contains setup_completed and contact_email)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('📊 Profile data:', profile);
      console.log('❌ Profile error:', profileError);

      // If no profile exists, create one
      if (!profile && profileError?.code === 'PGRST116' && userEmail) {
        console.log('🆕 No profile found, creating new profile...');
        const newProfile = await createUserProfile(userId, userEmail);
        if (newProfile) {
          const userData = {
            id: userId,
            email: userEmail,
            setupCompleted: false,
            companies: [],
            vehicles: [],
            drivers: []
          };
          console.log('👤 Setting user data with new profile:', userData);
          setUserData(userData);
          return;
        }
      }

      const setupCompleted = !!(profile as { setup_completed?: boolean })?.setup_completed;

      // Find the default company for the user
      const { data: access, error: accessError } = await supabase
        .from('user_company_access')
        .select('company_id, role, is_default')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (accessError) {
        console.warn('⚠️ Could not load user_company_access:', accessError);
      }

      let companies: Company[] = [];
      let activeCompanyId: string | null = null;

      if (access?.company_id) {
        const { data: companyRow, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', access.company_id)
          .maybeSingle();

        if (companyError) {
          console.error('❌ Error loading company:', companyError);
        } else if (companyRow) {
          const company: Company = {
            id: companyRow.id,
            name: companyRow.company_name || '',
            cif: companyRow.cif || '',
            cnp: companyRow.cnp || undefined,
            type: (companyRow.company_type as 'PFA' | 'SRL') || 'PFA',
            vatPayer: !!companyRow.vat_payer,
            vatIntraCommunity: (profile as { vat_intra_community?: string })?.vat_intra_community || '',
            address: {
              street: companyRow.address_street || '',
              city: companyRow.address_city || '',
              county: companyRow.address_county || '',
              postalCode: companyRow.address_postal_code || ''
            },
            contact: {
              phone: companyRow.contact_phone || '',
              email: companyRow.contact_email || (profile as { contact_email?: string })?.contact_email || ''
            },
            createdAt: companyRow.created_at ? new Date(companyRow.created_at) : new Date(),



            updatedAt: companyRow.updated_at ? new Date(companyRow.updated_at) : new Date()
          };

          companies = [company];
          activeCompanyId = company.id;
          setCompany(company); // legacy setter for backward compatibility in UI
        }
      }

      // Load vehicles for the active company
      const vehiclesForStore: Vehicle[] = [];
      if (activeCompanyId) {
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', activeCompanyId);

        if (vehicles) {
          console.log('🚗 Loading vehicles data:', vehicles.length, 'vehicles found');
          vehicles.forEach((vehicle: { id: string; make?: string; model?: string; license_plate?: string; year?: number; vin?: string; created_at?: string; updated_at?: string }) => {
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
            vehiclesForStore.push(vehicleData);
          });
        }
      }

      // Load drivers for the active company
      const driversForStore: Driver[] = [];
      if (activeCompanyId) {
        const { data: drivers } = await supabase
          .from('drivers')
          .select('*')
          .eq('company_id', activeCompanyId);

        if (drivers) {
          console.log('👨‍✈️ Loading drivers data:', drivers.length, 'drivers found');
          drivers.forEach((driver: { id: string; name?: string; cnp?: string; license_number?: string; license_expiry_date?: string; created_at?: string; updated_at?: string }) => {
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
            driversForStore.push(driverData);
          });
        }
      }

      // Finally set the complete user data
      const userData = {
        id: userId,
        email: (profile as { contact_email?: string })?.contact_email || userEmail || '',
        setupCompleted: setupCompleted,
        companies,
        vehicles: vehiclesForStore,
        drivers: driversForStore
      };
      console.log('✅ Setting complete user data. Setup completed:', setupCompleted);
      setUserData(userData);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  }, [setUserData, setCompany, addVehicle, addDriver]);

  useEffect(() => {
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
          await loadUserData(session.user.id, session.user.email || undefined);
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
        await loadUserData(session.user.id, session.user.email || undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, loadUserData, setCompany, setUserData]);

  const signUp = async (email: string, password: string) => {
    // Use proper redirect URLs based on environment
    const isProduction = window.location.hostname === 'autoconta.lovable.app' || window.location.hostname.includes('.lovable.app');
    const isLocalhost = window.location.hostname === 'localhost';

    let redirectUrl = '/auth/callback';

    if (isProduction) {
      redirectUrl = `https://autoconta.lovable.app/auth/callback`;
    } else if (isLocalhost) {
      // Folosim portul curent pentru dezvoltare locală
      redirectUrl = `${window.location.origin}/auth/callback`;
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
      // Folosim portul curent pentru dezvoltare locală
      redirectUrl = `${window.location.origin}/auth/callback`;
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
      console.log('🧪 Running in local development environment on port', window.location.port);
      console.log('⚠️  IMPORTANT: Make sure Google Cloud Console has', window.location.origin, 'in Authorized JavaScript origins');
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
      return { error: error as Error };
    }
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
}