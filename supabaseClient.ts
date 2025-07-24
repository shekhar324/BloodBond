import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwdbpnlqxzgazmjtvqmm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZGJwbmxxeHpnYXptanR2cW1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTU1MTQsImV4cCI6MjA2NTM3MTUxNH0.QjXJr02tUbE2DWHcqoXVwW-XcDgAbTFDWtqhn6dDuVI';

export const supabase = createClient(supabaseUrl, supabaseKey); 