// This file connects our app to Supabase, which is the online database and
// backend service that stores all of our app's data (like user accounts,
// shifts, listings, etc).
//
// Think of it like a phone line: this file "dials the number" for our
// Supabase project so the rest of the app can ask it for data or save data
// to it, without every single page needing to set up its own connection.
//
// The two secret values below (the URL and the "anon key") are NOT typed
// directly into this file. Instead, they are read from environment
// variables, which are values stored outside the code (in a file called
// .env.local on your computer, or in your hosting provider's settings when
// the site is live). This keeps the values out of the code that gets
// uploaded to GitHub.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// The client is created lazily (on first use) rather than as soon as this
// file is imported. Next.js imports every page module during `next build`
// to check what it needs, and if we connected to Supabase at import time,
// a build machine without the real environment variables set (e.g. a CI
// runner) would crash before it ever renders a single page. Waiting until
// something actually queries Supabase means the build only needs the real
// keys once the app is actually running.
let client: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (!client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local'
      );
    }

    client = createClient(supabaseUrl, supabaseAnonKey);
  }

  return client;
}

// This is the actual connection to Supabase. Import "supabase" anywhere
// else in the app to read or write data.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
});
