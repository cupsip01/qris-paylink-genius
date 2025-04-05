import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://klltuycxuymjnrpewjre.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbHR1eWN4dXltam5ycGV3anJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyOTA4NTMsImV4cCI6MjA1ODg2Njg1M30.i6UhdDBzUHvRFim7PwvRuL-5dsovwBH0sjffJOI7sXQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
