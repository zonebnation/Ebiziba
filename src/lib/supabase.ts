import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = 'https://whbnpvdharodkunhfukw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYm5wdmRoYXJvZGt1bmhmdWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Nzg2NjgsImV4cCI6MjA1ODM1NDY2OH0.T0gYMZtGK1X9nK4HYnGOrXgFySmtxyHpVZoK6DyY9i8';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
