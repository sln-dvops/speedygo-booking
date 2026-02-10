-- Table for all orders (both individual and bulk parent orders)
CREATE TABLE public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_name TEXT NOT NULL,
    sender_address TEXT NOT NULL,
    sender_contact_number TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    detrack_id TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    is_bulk_order BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Table specifically for bulk orders
CREATE TABLE public.bulk_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id),
    total_parcels INTEGER NOT NULL,
    total_weight DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Table for individual parcels (both standalone and part of bulk orders)
CREATE TABLE public.parcels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id),
    bulk_order_id UUID REFERENCES public.bulk_orders(id),
    parcel_size TEXT NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    length DECIMAL(10, 2) NOT NULL,
    width DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    pricing_tier TEXT NOT NULL, -- Added pricing_tier column
    recipient_name TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    recipient_contact_number TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_line1 TEXT NOT NULL,
    recipient_line2 TEXT,
    recipient_postal_code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    detrack_item_id TEXT,
    detrack_job_id TEXT,
    status TEXT DEFAULT 'pending'
);

-- Add indexes for better query performance
CREATE INDEX idx_parcels_order_id ON public.parcels(order_id);
CREATE INDEX idx_parcels_bulk_order_id ON public.parcels(bulk_order_id);
CREATE INDEX idx_bulk_orders_order_id ON public.bulk_orders(order_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_parcels_detrack_item_id ON public.parcels(detrack_item_id);
