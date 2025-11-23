-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', etc.
  entity_type VARCHAR(50) NOT NULL, -- 'packaging', 'order', 'user', 'invitation'
  entity_id UUID, -- ID of the affected entity (nullable for general actions)
  entity_name TEXT, -- Name/description of the entity for easier reading
  details JSONB, -- Additional metadata about the action
  ip_address INET, -- User's IP address
  user_agent TEXT, -- User's browser/device info
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX idx_activity_logs_entity_id ON public.activity_logs(entity_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_combined ON public.activity_logs(user_id, entity_type, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin users can view all activity logs
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

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Only authenticated users can insert activity logs (through app logic)
CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- No one can update or delete activity logs (immutable audit trail)
-- This is enforced by not creating UPDATE or DELETE policies

-- Grant permissions
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
GRANT SELECT ON public.activity_logs TO service_role;

-- Add comment for documentation
COMMENT ON TABLE public.activity_logs IS 'Immutable audit trail of all user activities in the system';
COMMENT ON COLUMN public.activity_logs.action IS 'Type of action performed (create, update, delete, login, etc.)';
COMMENT ON COLUMN public.activity_logs.entity_type IS 'Type of entity affected (packaging, order, user, invitation)';
COMMENT ON COLUMN public.activity_logs.entity_id IS 'UUID of the affected entity';
COMMENT ON COLUMN public.activity_logs.details IS 'JSONB field containing additional context and changes';
