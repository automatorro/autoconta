import { supabase } from '@/integrations/supabase/client';

// Function to test Supabase directly in browser
export const debugSupabase = async () => {
  console.log('🔍 DEBUG: Starting Supabase test...');
  
  try {
    // Test 1: Check auth session
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 DEBUG: Session:', session?.session?.user?.email || 'No user');
    console.log('🔍 DEBUG: Session error:', sessionError);
    
    // Test 2: Try to access user_profiles table
    console.log('🔍 DEBUG: Testing user_profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);
    
    console.log('🔍 DEBUG: Profiles data:', profiles);
    console.log('🔍 DEBUG: Profiles error:', profilesError);
    
    // Test 3: Check all available tables
    console.log('🔍 DEBUG: Testing other tables...');
    
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .limit(1);
    console.log('🔍 DEBUG: Documents:', documents, 'Error:', documentsError);
    
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('*')
      .limit(1);
    console.log('🔍 DEBUG: Drivers:', drivers, 'Error:', driversError);
    
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .limit(1);
    console.log('🔍 DEBUG: Vehicles:', vehicles, 'Error:', vehiclesError);
    
  } catch (error) {
    console.error('🔍 DEBUG: Unexpected error:', error);
  }
};

// Test function to create a sample profile
export const createTestProfile = async () => {
  console.log('🧪 Creating test profile...');
  
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      console.log('❌ No authenticated user found');
      return;
    }
    
    const userId = session.session.user.id;
    console.log('👤 User ID:', userId);
    
    // Try to create or update a test profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        company_name: 'Test Company SRL',
        company_type: 'SRL',
        cif: 'RO12345678',
        setup_completed: true
      })
      .select()
      .single();
    
    console.log('✅ Test profile created:', data);
    console.log('❌ Profile creation error:', error);
    
  } catch (error) {
    console.error('🧪 Test profile creation failed:', error);
  }
};

// Make functions available globally for testing
(window as any).debugSupabase = debugSupabase;
(window as any).createTestProfile = createTestProfile;