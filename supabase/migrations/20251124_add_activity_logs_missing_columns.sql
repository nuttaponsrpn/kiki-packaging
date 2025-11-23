-- Add missing columns to activity_logs table
-- These columns were in the original schema but may not have been applied

-- Add entity_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_logs' 
    AND column_name = 'entity_name'
  ) THEN
    ALTER TABLE public.activity_logs ADD COLUMN entity_name TEXT;
  END IF;
END $$;

-- Add user_agent column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'activity_logs' 
    AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE public.activity_logs ADD COLUMN user_agent TEXT;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN public.activity_logs.entity_name IS 'Name/description of the entity for easier reading';
COMMENT ON COLUMN public.activity_logs.user_agent IS 'User browser/device information';
