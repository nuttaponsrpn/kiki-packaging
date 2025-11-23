-- Fix activity_logs foreign key to reference user_profiles instead of auth.users

-- Drop the old foreign key constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'activity_logs_user_id_fkey' 
    AND table_name = 'activity_logs'
  ) THEN
    ALTER TABLE public.activity_logs DROP CONSTRAINT activity_logs_user_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint to user_profiles
ALTER TABLE public.activity_logs 
  ADD CONSTRAINT activity_logs_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.user_profiles(id) 
  ON DELETE CASCADE;

-- Update RLS policy to reference user_profiles instead of users
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
