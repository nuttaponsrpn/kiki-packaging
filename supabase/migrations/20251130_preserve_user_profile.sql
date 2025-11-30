-- Add email column to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Backfill email from auth.users
UPDATE public.user_profiles
SET email = auth.users.email
FROM auth.users
WHERE public.user_profiles.id = auth.users.id;

-- Make email required (optional, but good for data integrity if we want to rely on it)
-- ALTER TABLE public.user_profiles ALTER COLUMN email SET NOT NULL;

-- Drop the existing foreign key that cascades deletion
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Re-add the foreign key WITHOUT cascade (so deleting auth.users does NOT delete profile)
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL; -- Wait, id is PK, cannot be null.
  -- So we should use ON DELETE NO ACTION (default) or just not specify ON DELETE.
  -- But if we delete auth.users, and this FK exists, it will FAIL unless we remove the FK entirely or use SET NULL (impossible for PK).
  -- If we want to keep the profile, we effectively have to decouple it from auth.users or allow the FK to be broken?
  -- Postgres FKs enforce referential integrity. We cannot have a profile pointing to a non-existent user.
  -- UNLESS we remove the FK constraint entirely.
  
-- Remove the FK constraint entirely to allow profile to exist without auth user
-- OR change the ID column? No, ID is UUID.
-- If we want to keep the record, we must remove the FK constraint to auth.users.
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, email, role, is_active)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'staff'),
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
