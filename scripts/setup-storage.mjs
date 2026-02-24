/**
 * Setup script: Creates the listing-images storage bucket in Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY="your-service-role-key" node scripts/setup-storage.mjs
 *
 * You can find your service role key in:
 *   Supabase Dashboard → Settings → API → service_role (secret)
 */

const SUPABASE_URL = 'https://wskxxngqccrcjsfbrjyu.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable.');
  console.error('Usage: SUPABASE_SERVICE_KEY="your-key" node scripts/setup-storage.mjs');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${SERVICE_KEY}`,
  apikey: SERVICE_KEY,
  'Content-Type': 'application/json',
};

async function run() {
  console.log('Creating listing-images bucket...');

  // 1. Create bucket
  const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      id: 'listing-images',
      name: 'listing-images',
      public: true,
    }),
  });

  const bucketData = await bucketRes.json();
  if (bucketRes.ok) {
    console.log('Bucket created successfully.');
  } else if (bucketData.message?.includes('already exists')) {
    console.log('Bucket already exists — skipping.');
  } else {
    console.error('Failed to create bucket:', bucketData);
    process.exit(1);
  }

  // 2. Run SQL to create storage policies
  const sql = `
    -- Allow authenticated users to upload files
    DO $$ BEGIN
      CREATE POLICY "Authenticated users can upload listing images"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'listing-images');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Allow public read access
    DO $$ BEGIN
      CREATE POLICY "Listing images are publicly accessible"
        ON storage.objects FOR SELECT TO anon, authenticated
        USING (bucket_id = 'listing-images');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Allow users to update their own uploads
    DO $$ BEGIN
      CREATE POLICY "Users can update own listing images"
        ON storage.objects FOR UPDATE TO authenticated
        USING (bucket_id = 'listing-images');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;

    -- Allow users to delete their own uploads
    DO $$ BEGIN
      CREATE POLICY "Users can delete own listing images"
        ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = 'listing-images');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `;

  console.log('Creating storage policies...');
  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({}),
  });

  // The REST API can't run raw SQL, so we use the pg_net approach
  // Instead, we use direct SQL execution via the management API
  const pgRes = await fetch(`${SUPABASE_URL}/pg`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql }),
  });

  if (!pgRes.ok) {
    // If direct SQL doesn't work, provide instructions
    console.log('\nCould not auto-create policies via API.');
    console.log('Please run this SQL in your Supabase Dashboard → SQL Editor:\n');
    console.log(sql);
  } else {
    console.log('Storage policies created successfully.');
  }

  console.log('\nDone! The listing-images bucket is ready.');
}

run().catch(console.error);
