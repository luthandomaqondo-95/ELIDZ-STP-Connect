import { createClient } from '@/lib/supabase/server';

async function checkDatabaseSchema() {
  try {
    const supabase = await createClient();
    
    // Test 1: Check if verification_status column exists
    const { data: columns, error: columnError } = await supabase
      .from('profiles')
      .select('verification_status')
      .limit(1);
    
    if (columnError) {
      console.log('❌ verification_status column error:', columnError.message);
      console.log('This means the column likely does not exist');
    } else {
      console.log('✅ verification_status column exists');
    }
    
    // Test 2: Check table structure
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profileError) {
      console.log('❌ Error accessing profiles table:', profileError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profiles table accessible');
      console.log('Available columns:', Object.keys(profiles[0]));
    } else {
      console.log('✅ Profiles table exists but is empty');
    }
    
    // Test 3: Try to update verification status (this will fail if column doesn't exist)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('id', '00000000-0000-0000-0000-000000000000'); // fake ID
      
    if (updateError) {
      console.log('❌ Update test failed:', updateError.message);
      if (updateError.message.includes('column') || updateError.message.includes('verification_status')) {
        console.log('🔍 This confirms the verification_status column is missing');
      }
    } else {
      console.log('✅ Update test succeeded (column exists)');
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

checkDatabaseSchema();
