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
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Profile data:', profile);
      console.log('❌ Profile error:', profileError);

      if (profile && profile.setup_completed) {
        console.log('✅ Profile found and setup completed, loading company data...');
        // Create company object from profile
        const company: Company = {
          id: profile.id,
          name: profile.company_name,
          cif: profile.cif,
          cnp: profile.cnp,
          type: profile.company_type as 'PFA' | 'SRL',
          vatPayer: profile.vat_payer,
          address: {
            street: profile.address_street || '',
            city: profile.address_city || '',
            county: profile.address_county || '',
            postalCode: profile.address_postal_code || ''
          },
          contact: {
            phone: profile.contact_phone || '',
            email: profile.contact_email || ''
          },
          createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
          updatedAt: profile.updated_at ? new Date(profile.updated_at) : new Date()
        };
        console.log('🏢 Setting company:', company);
        setCompany(company);
        
        // Set user with profile data to persist setup_completed status
        const userData = {
          id: profile.user_id,
          email: profile.email || '',
          setupCompleted: profile.setup_completed || false,
          company: company,
          vehicles: [],
          drivers: []
        };
        console.log('👤 Setting user data:', userData);
        // Note: We'll update vehicles and drivers arrays below

        // Load vehicles
        const { data: vehicles } = await supabase
          .from('vehicles')
          .select('*')
          .eq('user_id', userId);

        if (vehicles) {
          console.log('🚗 Loading vehicles data:', vehicles.length, 'vehicles found');
          vehicles.forEach((vehicle) => {
            const vehicleData: Vehicle = {
              id: vehicle.id,
              make: vehicle.make,
              model: vehicle.model,
              plateNumber: vehicle.license_plate || '',
              year: vehicle.year || 0,
              vin: vehicle.vin || '',
              documents: {
                itp: {
                  documentNumber: vehicle.itp_document_number || '',
                  issueDate: vehicle.itp_issue_date ? new Date(vehicle.itp_issue_date) : new Date(),
                  expiryDate: vehicle.itp_expiry_date ? new Date(vehicle.itp_expiry_date) : new Date()
                },
                rca: {
                  documentNumber: vehicle.rca_document_number || '',
                  issueDate: vehicle.rca_issue_date ? new Date(vehicle.rca_issue_date) : new Date(),
                  expiryDate: vehicle.rca_expiry_date ? new Date(vehicle.rca_expiry_date) : new Date()
                }
              },
              createdAt: vehicle.created_at ? new Date(vehicle.created_at) : new Date(),
              updatedAt: vehicle.updated_at ? new Date(vehicle.updated_at) : new Date()
            };
            addVehicle(vehicleData);
            userData.vehicles.push(vehicleData);
          });
        }

        // Load drivers
        const { data: drivers } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', userId);

        if (drivers) {
          console.log('👨‍✈️ Loading drivers data:', drivers.length, 'drivers found');
          drivers.forEach((driver) => {
            const driverData: Driver = {
              id: driver.id,
              name: driver.name,
              cnp: driver.cnp,
              licenseNumber: driver.license_number,
              certificates: {
                professionalAttestation: {
                  documentNumber: driver.attestation_number || '',
                  issueDate: driver.attestation_issue_date ? new Date(driver.attestation_issue_date) : new Date(),
                  expiryDate: driver.attestation_expiry_date ? new Date(driver.attestation_expiry_date) : new Date()
                },
                medicalCertificate: {
                  documentNumber: driver.medical_certificate_number || '',
                  issueDate: driver.medical_certificate_issue_date ? new Date(driver.medical_certificate_issue_date) : new Date(),
                  expiryDate: driver.medical_certificate_expiry_date ? new Date(driver.medical_certificate_expiry_date) : new Date()
                }
              },
              vehicleIds: driver.vehicle_ids || [],
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
          console.log('👋 User signed out, clearing data');
          // Clear any cached data when user signs out
          setUser(null);
          setSession(null);
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
    // Ensure we're using relative URLs for redirects to avoid cross-origin issues
    const redirectUrl = '/';
    console.log('🔗 Google OAuth redirect URL:', redirectUrl);
    console.log('🌐 Current origin:', window.location.origin);
    console.log('🌍 Current hostname:', window.location.hostname);
    
    // Log whether we're on localhost or production
    if (window.location.hostname === 'localhost') {
      console.log('🧪 Running in local development environment');
    } else {
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
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  };
}