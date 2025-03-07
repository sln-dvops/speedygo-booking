-- Create the orders table
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_address TEXT NOT NULL,
    sender_contact_number TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_contact_number TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_line1 TEXT NOT NULL,
    recipient_line2 TEXT,
    recipient_postal_code TEXT NOT NULL,
    parcel_size TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    detrack_id TEXT, -- can be NULL 
    status TEXT DEFAULT 'pending' NOT NULL, -- to change
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- consider including Detrack specific ID, and status to be updated by the webhook

-- Create the function for the updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public inserts only
CREATE POLICY insert_policy ON public.orders FOR INSERT TO public WITH CHECK (true);

-- Prevent all other operations (select, update, delete) for public
CREATE POLICY deny_all_policy ON public.orders FOR ALL TO public USING (false);

-- Grant INSERT permission to public
GRANT INSERT ON public.orders TO public;