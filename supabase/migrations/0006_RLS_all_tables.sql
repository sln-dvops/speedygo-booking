-- Migration: Enable Row Level Security (RLS) on all tables
-- Description: This migration enables RLS on bulk_orders, orders, and parcels tables
-- Note: No specific policies are created as the application uses service role keys

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.orders IS 'Table for all orders with RLS enabled. Access controlled via service role.';

-- Enable RLS on bulk_orders table
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.bulk_orders IS 'Table for bulk orders with RLS enabled. Access controlled via service role.';

-- Enable RLS on parcels table
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.parcels IS 'Table for parcels with RLS enabled. Access controlled via service role.';

-- Add a comment explaining the security approach
COMMENT ON SCHEMA public IS 'Public schema with RLS enabled on all tables. 
The application uses Supabase service role for server-side operations, which bypasses RLS.
No specific policies are needed as all database access is through server-side code with the service role.';
