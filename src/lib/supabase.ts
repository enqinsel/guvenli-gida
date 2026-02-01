import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (for browser)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side Supabase client (for API routes, bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Database types
export interface Food {
  id: string;
  announcement_date: string;
  company_name: string;
  brand: string;
  product_name: string;
  violation: string;
  batch_number: string;
  district: string;
  city: string;
  product_group: string;
  category: string;
  is_active: boolean;
  created_at: string;
  removed_at: string | null;
}

export interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}
