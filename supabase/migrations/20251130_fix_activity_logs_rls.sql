-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert their own activity logs" ON public.activity_logs;

-- Create a new policy that allows users to insert logs for themselves OR admins to insert for anyone
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (
    -- User inserting for themselves
    auth.uid() = user_id
    OR
    -- Admin inserting for anyone
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
