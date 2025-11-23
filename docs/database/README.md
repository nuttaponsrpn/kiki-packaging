# Database Setup Guide

## Overview

This project uses **Supabase** (PostgreSQL) as the database. The schema includes tables for users, packaging products, orders, activity logs, and user invitations.

## Files

- `schema.sql` - Complete database schema for new installations
- `migration-add-packaging-fields.sql` - Migration to add missing fields to existing databases

## Fresh Installation

If you're setting up the database for the first time:

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service role key for server-side operations
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

### 3. Run Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `schema.sql`
4. Paste and run the script

This will create:
- ✅ `user_profiles` table
- ✅ `user_invitations` table
- ✅ `packaging_products` table
- ✅ `orders` table
- ✅ `activity_logs` table
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for automatic logging

### 4. Create Your First Admin User

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Copy the user's UUID
5. Run this SQL query to create their profile:

```sql
INSERT INTO public.user_profiles (id, name, role)
VALUES (
  'paste-user-uuid-here',
  'Your Name',
  'admin'
);
```

### 5. Optional: Add Sample Data

Uncomment and run the sample data section in `schema.sql` to add test products.

## Updating Existing Database

If you already have the database set up but need to add the new packaging fields:

### Run Migration

1. Open Supabase SQL Editor
2. Copy the contents of `migration-add-packaging-fields.sql`
3. Run the migration

This adds:
- `sku` column (Stock Keeping Unit - unique identifier)
- `unit` column (e.g., "box", "roll", "piece")
- `category` column (for grouping products)
- `image_url` column (product images)

## Database Schema

### User Profiles

```sql
user_profiles
├── id (UUID, FK to auth.users)
├── name (TEXT)
├── role (TEXT: 'admin' | 'staff')
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── last_login_at (TIMESTAMP)
```

### User Invitations

```sql
user_invitations
├── id (UUID)
├── email (TEXT)
├── name (TEXT)
├── role (TEXT: 'admin' | 'staff')
├── invite_token (UUID, UNIQUE)
├── invited_by (UUID, FK to user_profiles)
├── expires_at (TIMESTAMP)
├── accepted_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Packaging Products

```sql
packaging_products
├── id (UUID)
├── name (TEXT)
├── description (TEXT)
├── sku (TEXT, UNIQUE) ← Required
├── unit (TEXT) ← Required
├── unit_price (DECIMAL)
├── stock_quantity (INTEGER)
├── category (TEXT)
├── image_url (TEXT)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Orders

```sql
orders
├── id (UUID)
├── user_id (UUID, FK to user_profiles)
├── packaging_product_id (UUID, FK to packaging_products)
├── quantity (INTEGER)
├── total_price (DECIMAL)
├── status (TEXT: 'pending' | 'processing' | 'completed' | 'cancelled')
├── notes (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

### Activity Logs

```sql
activity_logs
├── id (UUID)
├── user_id (UUID, FK to user_profiles)
├── action (TEXT)
├── entity_type (TEXT)
├── entity_id (UUID)
├── details (JSONB)
├── ip_address (TEXT)
└── created_at (TIMESTAMP)
```

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### User Profiles
- Users can view their own profile
- Admins can view/update all profiles

### Packaging Products
- All authenticated users can view products
- Only admins can create/update/delete products

### Orders
- Users can view their own orders
- Admins can view all orders
- Users can create their own orders
- Users can update their own pending orders
- Admins can update any order

### Activity Logs
- Users can view their own logs
- Admins can view all logs
- Users can insert their own logs

### User Invitations
- Only admins can view/create/update/delete invitations

## Automatic Triggers

### Updated At Trigger
Automatically updates the `updated_at` field when records are modified:
- `packaging_products`
- `orders`
- `user_invitations`

### Activity Logging Triggers
Automatically creates activity log entries for:
- New order creation
- Order status changes

## Indexes

Optimized indexes for performance:
- User role lookups
- Product SKU lookups
- Active product filtering
- Category filtering
- Order status filtering
- Activity log queries

## Testing the Setup

### 1. Test Connection

In your Nuxt app, the `useSupabase()` composable should work:

```typescript
const supabase = useSupabase();
const { data, error } = await supabase.from("packaging_products").select("*");
console.log(data); // Should return empty array (or sample data)
```

### 2. Test RLS Policies

Try querying as different users to ensure RLS is working:

```typescript
// As admin - should see all products
const { data: products } = await supabase
  .from("packaging_products")
  .select("*");

// As staff - should only create own orders
const { data: order } = await supabase
  .from("orders")
  .insert({ ... });
```

### 3. Add Test Products

Use the packaging management page at `/packaging` to add products through the UI.

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran `schema.sql` in the SQL Editor
- Check that you're connected to the correct Supabase project

### Error: "permission denied"
- Check RLS policies are correctly set up
- Ensure user is authenticated
- Verify user has correct role (admin/staff)

### Error: "duplicate key value violates unique constraint"
- SKU must be unique across all products
- Check for existing products with the same SKU

### Migration Issues
- If migration fails, check that the columns don't already exist
- Ensure you have admin access to the database
- Check Supabase logs for detailed error messages

## Next Steps

After database setup:

1. ✅ Test login with admin user
2. ✅ Create packaging products via UI
3. ✅ Set up Edge Function for invitation emails
4. ✅ Test user invitation flow
5. ✅ Create orders and verify activity logs

## Backup & Restore

### Backup
Supabase provides automatic daily backups. To create manual backup:
1. Go to **Database** → **Backups**
2. Click **Create backup**

### Restore
Contact Supabase support for restoration from backups.

## Production Considerations

- Enable Point-in-Time Recovery (PITR) for production
- Set up database monitoring and alerts
- Review and optimize indexes based on query patterns
- Implement database connection pooling
- Set up automated backups schedule

---

**Last Updated:** 2024-11-23
**Schema Version:** 2.0 (with packaging fields)
