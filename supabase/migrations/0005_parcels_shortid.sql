-- Add the short_id column to the parcels table
ALTER TABLE public.parcels 
ADD COLUMN short_id TEXT;

-- Create an index on the short_id column for faster searching
CREATE INDEX idx_parcels_short_id ON public.parcels(short_id);

-- Create a trigger to automatically populate the short_id column for new records
-- We can reuse the existing set_short_id function, but need a new trigger
CREATE TRIGGER trigger_set_parcel_short_id
BEFORE INSERT OR UPDATE OF id ON public.parcels
FOR EACH ROW
EXECUTE FUNCTION set_short_id();

-- Add a comment to explain the purpose of the short_id column
COMMENT ON COLUMN public.parcels.short_id IS 'Last 12 characters of the UUID for easier searching and user reference';