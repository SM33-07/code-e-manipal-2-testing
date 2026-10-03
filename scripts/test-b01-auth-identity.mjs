import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.error('❌ Missing required Supabase environment variables');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runB01Spike() {
  console.log('=== B-01 AUTH IDENTITY SPIKE TEST ===');
  console.log('Target Supabase Host:', new URL(supabaseUrl).hostname);

  const testFormats = [
    { name: 'auth.codeemanipal.in', email: `test-spike-${Date.now()}@auth.codeemanipal.in` },
    { name: 'cem.local', email: `test-spike-${Date.now()}@cem.local` },
  ];

  for (const fmt of testFormats) {
    console.log(`\n--- Testing Domain Format: ${fmt.name} (${fmt.email}) ---`);
    let testUserId = null;

    try {
      // 1. Admin Create User
      console.log('1. Testing admin.createUser with email_confirm: true...');
      const testPassword = 'TestSpikePassword!123';
      const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
        email: fmt.email,
        password: testPassword,
        email_confirm: true,
        user_metadata: { name: 'Spike Test User', role: 'participant' },
      });

      if (createError) {
        console.error(`❌ admin.createUser failed for ${fmt.name}:`, createError.message);
        continue;
      }

      testUserId = createData.user?.id;
      console.log(`✅ User created successfully! ID: ${testUserId}`);
      console.log(`   Email Confirmed At: ${createData.user?.email_confirmed_at}`);

      // 2. Test Sign In with Anon Client
      console.log('2. Testing client signInWithPassword...');
      const { data: signinData, error: signinError } = await anonClient.auth.signInWithPassword({
        email: fmt.email,
        password: testPassword,
      });

      if (signinError) {
        console.error(`❌ signInWithPassword failed:`, signinError.message);
      } else {
        console.log(`✅ signInWithPassword succeeded! Session obtained for user: ${signinData.user?.id}`);
      }

      // 3. Test Password Update via Admin API
      console.log('3. Testing admin.updateUserById (password reset)...');
      const updatedPassword = 'NewSpikePassword!456';
      const { data: updateData, error: updateError } = await adminClient.auth.admin.updateUserById(
        testUserId,
        { password: updatedPassword }
      );

      if (updateError) {
        console.error(`❌ admin.updateUserById failed:`, updateError.message);
      } else {
        console.log(`✅ admin.updateUserById succeeded!`);
      }

      // 4. Test Sign In with new password
      console.log('4. Testing signInWithPassword with updated password...');
      const { data: signinNewData, error: signinNewError } = await anonClient.auth.signInWithPassword({
        email: fmt.email,
        password: updatedPassword,
      });

      if (signinNewError) {
        console.error(`❌ signInWithPassword (new password) failed:`, signinNewError.message);
      } else {
        console.log(`✅ signInWithPassword (new password) succeeded!`);
      }

    } catch (err) {
      console.error(`💥 Unexpected error during test:`, err);
    } finally {
      // 5. Cleanup Test User
      if (testUserId) {
        console.log('5. Cleaning up test user via admin.deleteUser...');
        const { error: delError } = await adminClient.auth.admin.deleteUser(testUserId);
        if (delError) {
          console.error(`⚠️ Failed to cleanup test user ${testUserId}:`, delError.message);
        } else {
          console.log(`🧹 Cleaned up test user ${testUserId} successfully.`);
        }
      }
    }
  }

  console.log('\n=== B-01 SPIKE TEST COMPLETE ===');
}

runB01Spike();
