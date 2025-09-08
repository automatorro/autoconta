import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 STARTING SUPABASE CONNECTION TEST...');
    console.log('🔍 Current URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('🔍 Publishable key exists:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    // Test basic connection
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('🔐 Auth session:', authData.session?.user?.email || 'No user');
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return false;
    }
    
    // Test if user_profiles table exists
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    console.log('📊 Table query result - Data:', data, 'Error:', error);
    
    if (error) {
      console.error('❌ Table access error:', error);
      if (error.code === 'PGRST116') {
        console.log('💡 Table does not exist or RLS is blocking access');
      } else if (error.code === '42P01') {
        console.log('💡 Table user_profiles does not exist');
      } else {
        console.log('💡 Unknown error accessing table:', error.code, error.message);
      }
      return false;
    }
    
    console.log('✅ Supabase connection and table access working!');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}