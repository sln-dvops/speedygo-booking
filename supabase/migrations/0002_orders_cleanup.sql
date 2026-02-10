-- Create a function to clean up unpaid orders (fixed version)
CREATE OR REPLACE FUNCTION cleanup_unpaid_orders()
RETURNS void AS $$
DECLARE
  deleted_parcels INTEGER := 0;
  deleted_bulk_orders INTEGER := 0;
  deleted_orders INTEGER := 0;
  order_ids UUID[];
BEGIN
  -- First, get the IDs of orders to delete (unpaid and older than the specified time)
  SELECT ARRAY_AGG(id) INTO order_ids
  FROM public.orders 
  WHERE 
    status != 'paid' AND 
    created_at < NOW() - INTERVAL '24 hours'; -- For testing (change to '24 hours' in production)
  
  -- If no orders to delete, exit early
  IF order_ids IS NULL OR array_length(order_ids, 1) IS NULL THEN
    RAISE NOTICE 'No unpaid orders found to delete';
    RETURN;
  END IF;
  
  -- Delete parcels linked to these orders
  WITH deleted AS (
    DELETE FROM public.parcels
    WHERE order_id = ANY(order_ids)
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_parcels FROM deleted;
  
  RAISE NOTICE 'Deleted % parcels', deleted_parcels;
  
  -- Delete bulk orders linked to these orders
  WITH deleted AS (
    DELETE FROM public.bulk_orders
    WHERE order_id = ANY(order_ids)
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_bulk_orders FROM deleted;
  
  RAISE NOTICE 'Deleted % bulk orders', deleted_bulk_orders;
  
  -- Finally delete the orders themselves
  WITH deleted AS (
    DELETE FROM public.orders
    WHERE id = ANY(order_ids)
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_orders FROM deleted;
  
  RAISE NOTICE 'Deleted % orders', deleted_orders;
END;
$$ LANGUAGE plpgsql;

-- Create a function you can call manually to test
CREATE OR REPLACE FUNCTION test_cleanup_unpaid_orders()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  PERFORM cleanup_unpaid_orders();
  result := 'Cleanup function executed. Check logs for details.';
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the cleanup function to run every 12 hours
SELECT cron.schedule('cleanup_unpaid_orders_job', '0 */12 * * *', 'SELECT cleanup_unpaid_orders()');