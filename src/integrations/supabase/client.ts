
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://klltuycxuymjnrpewjre.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbHR1eWN4dXltam5ycGV3anJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyOTA4NTMsImV4cCI6MjA1ODg2Njg1M30.i6UhdDBzUHvRFim7PwvRuL-5dsovwBH0sjffJOI7sXQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
