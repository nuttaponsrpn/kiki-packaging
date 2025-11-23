# Supabase Setup Guide

## Quick Start

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `kiki-packaging`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be ready (~2 minutes)

### 2. Get Your Credentials

1. In your Supabase dashboard, go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJhbGc...`)

### 3. Update Environment Variables

Create `.env` file in project root:

```bash
# Copy from .env.example
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```env
NUXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy entire content from `docs/database/schema.sql`
4. Paste and click **Run**
5. Verify tables created:
   - `user_profiles`
   - `packaging_products`
   - `orders`
   - `activity_logs`

### 5. Create First Admin User

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Create User**
5. Copy the User UID

#### Option B: Via SQL Editor

```sql
-- This will be done automatically when user signs up via your app
-- But you can manually create via dashboard (Option A above)
```

### 6. Add User to user_profiles Table

In SQL Editor, run:

```sql
-- Replace 'USER_UID_HERE' with the actual UID from step 5
-- Replace values as needed
INSERT INTO user_profiles (id, name, role)
VALUES ('USER_UID_HERE', 'Admin User', 'admin');
```

### 7. Test Login

1. Start your dev server: `yarn dev`
2. Go to `http://localhost:3000/login`
3. Login with the email/password you created
4. You should be redirected to dashboard

## Database Schema Overview

### Tables Created:

- **user_profiles** - User information and roles
- **packaging_products** - Product catalog
- **orders** - Order management
- **activity_logs** - Audit trail

### Features:

✅ Row Level Security (RLS) policies
✅ Automatic timestamps (created_at, updated_at)
✅ Activity logging triggers
✅ Indexes for performance
✅ Views for complex queries

## Row Level Security (RLS)

The schema includes RLS policies that:

- Users can only see their own data
- Admins can see all data
- Automatic activity logging on changes

## Next Steps

After setup, you can:

1. ✅ Login with Supabase auth
2. ✅ Create orders
3. ✅ Manage packaging products
4. ✅ View activity logs
5. ✅ Manage users (admin only)

## Troubleshooting

### "Invalid login credentials"

- Check email/password are correct
- Verify user exists in Authentication > Users
- Check user has entry in user_profiles table

### "No user profile found"

- Run the INSERT query from step 6
- Check user ID matches between auth.users and user_profiles

### "Permission denied"

- Check RLS policies are enabled
- Verify user has correct role in user_profiles
- Check you're logged in with correct account

## Environment Variables Reference

```env
# Required for Supabase
NUXT_PUBLIC_SUPABASE_URL=        # Your project URL
NUXT_PUBLIC_SUPABASE_ANON_KEY=   # Your anon/public key

# Optional (already configured)
NUXT_PUBLIC_APP_NAME=            # App display name
NUXT_PUBLIC_API_BASE_URL=        # For external APIs (if needed)
```

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
