-- Create a function to extract the last 12 characters from a UUID and add the SPDY prefix
CREATE OR REPLACE FUNCTION extract_last_12_chars(uuid UUID) 
RETURNS TEXT AS $$
BEGIN
  RETURN 'SPDY' || RIGHT(uuid::text, 12);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add the short_id column to the orders table
ALTER TABLE public.orders 
ADD COLUMN short_id TEXT;

-- Create an index on the short_id column for faster searching
CREATE INDEX idx_orders_short_id ON public.orders(short_id);

-- Update existing records to populate the short_id column
UPDATE public.orders 
SET short_id = extract_last_12_chars(id)
WHERE short_id IS NULL;

-- Create a trigger to automatically populate the short_id column for new records
CREATE OR REPLACE FUNCTION set_short_id() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.short_id := extract_last_12_chars(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_short_id
BEFORE INSERT OR UPDATE OF id ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_short_id();

-- Add a comment to explain the purpose of the short_id column
COMMENT ON COLUMN public.orders.short_id IS 'Last 12 characters of the UUID for easier searching and user reference';

