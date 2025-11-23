# Security Guide

## 🔒 Environment Variables Security

### Current Security Level: **High (Production Ready)** ✅

Your current setup uses **maximum client-side security** because:

1. ✅ `.env` is in `.gitignore` (secrets not committed)
2. ✅ **Supabase credentials NEVER sent to browser** - fetched from server API
3. ✅ All Supabase operations can go through authenticated server endpoints
4. ✅ Sensitive keys (`RESEND_API_KEY`) are in Supabase secrets, not `.env`
5. ✅ No service role keys exposed to client

---

## Architecture: Server-Side Configuration Delivery

### How It Works

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client    │ ───────▶│  Server API  │ ───────▶│   Supabase   │
│  (Browser)  │  /api/  │  /config     │  Client │   Database   │
└─────────────┘         └──────────────┘         └──────────────┘
   Fetches config          Provides URL           Full access
   on app start           and anon key           with RLS
```

1. **App starts** → Client calls `/api/supabase/config`
2. **Server responds** → Returns `supabaseUrl` and `supabaseAnonKey`
3. **Client initializes** → Creates Supabase client with server-provided config
4. **Credentials hidden** → Never bundled in JavaScript, not visible in DevTools

### Benefits

- 🔒 Credentials not in client bundle (can't be extracted from JavaScript files)
- 🔒 Can rotate keys without rebuilding client app
- 🔒 Server controls what config client receives
- 🔒 Additional layer of security even for "public" anon key

---

## Understanding Supabase Keys

### Anon Key - **Safe but now server-delivered**

```
SUPABASE_ANON_KEY=eyJhbGci...  (server-side only)
```

- ✅ Designed to work with Row Level Security (RLS) policies
- ✅ Can only access data allowed by your database policies
- ✅ Cannot bypass RLS or access restricted data
- ✅ **Now fetched from server** instead of bundled in client

### Service Role Key (Secret) - **NEVER expose**

```
SUPABASE_SERVICE_KEY=eyJhbGci...  ❌ SERVER-SIDE ONLY!
```

- ❌ Bypasses all RLS policies
- ❌ Full database access
- ❌ **NEVER** send to client or put in client-accessible config
- ✅ Only use in server-side code or Edge Functions

---

## What's Safe vs Unsafe

### ✅ SAFE to Put in `.env` (Server-Side)

```env
# Server-side only (never sent to browser)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci... (optional, for elevated operations)

# Client-side public (safe to expose)
NUXT_PUBLIC_APP_NAME="My App"
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
```

### ❌ UNSAFE - Never Put in `.env`

```env
# These should NEVER be in .env!
SUPABASE_SERVICE_ROLE_KEY=xxx        # ❌ Full DB access
DATABASE_PASSWORD=xxx                 # ❌ Direct DB access
PRIVATE_API_KEY=xxx                   # ❌ Backend secret
JWT_SECRET=xxx                        # ❌ Auth secret
```

### ⚙️ For Edge Functions Only (Supabase Secrets)

```bash
# Set these via Supabase CLI, NOT in .env
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set APP_URL=http://localhost:3000
```

---

## Security Levels & Recommendations

### Level 1: Current Setup (Development) ✅

**What you have:**

- Public keys in `.env`
- Protected by RLS
- `.env` in `.gitignore`

**Good for:**

- Development
- Small internal apps
- Prototypes

**Upgrade when:**

- Going to production
- Handling sensitive data
- Public-facing app

---

### Level 2: Server-Side API (Production) 🔒

**Add server routes to proxy requests:**

```typescript
// server/api/invitations.post.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // Use server-only env vars (without NUXT_PUBLIC_)
  const supabase = createClient(
    config.supabaseUrl, // Server-side only
    config.supabaseServiceKey || config.public.supabaseAnonKey // Prefer service key
  );

  // Handle request server-side
  const body = await readBody(event);
  const result = await supabase.from("user_invitations").insert(body);

  return result;
});
```

**Current Implementation:**

Our project now uses this approach! See:

- `server/api/supabase/[...path].ts` - Server API routes
- `app/composables/useInvitations.ts` - Updated to use server API
- Client calls `/api/supabase/invitations/*` instead of direct Supabase

**Benefits:**

- ✅ Credentials never reach browser
- ✅ Better control over requests
- ✅ Can add rate limiting
- ✅ Server-side validation
- ✅ Can use service role key safely (optional)

**Add to `nuxt.config.ts`:**

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-side only (never sent to client)
    supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY, // Optional

    // Client-side (public)
    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME,
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
});
```

**Server API Routes Implemented:**

- `POST /api/supabase/invitations/send` - Send invitation
- `POST /api/supabase/invitations/resend` - Resend invitation
- `POST /api/supabase/invitations/revoke` - Revoke invitation
- `GET /api/supabase/invitations/pending` - Get pending invitations

All routes verify authentication via JWT token in Authorization header.

---

### Level 3: Separate Environments 🏢

**Use different credentials per environment:**

```bash
# .env.development (local)
NUXT_PUBLIC_SUPABASE_URL=https://dev-xxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key

# .env.production (hosting platform)
NUXT_PUBLIC_SUPABASE_URL=https://prod-xxx.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
```

**Set in hosting platform:**

- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Railway**: Project → Variables

---

### Level 4: Secrets Management (Enterprise) 🏰

**Use dedicated secrets services:**

- **Doppler**: https://doppler.com (easiest)
- **AWS Secrets Manager**
- **Azure Key Vault**
- **HashiCorp Vault**

**Example with Doppler:**

```bash
# Install Doppler CLI
npm install -g doppler

# Login and setup
doppler login
doppler setup

# Run app with secrets
doppler run -- yarn dev
```

---

## Production Deployment Checklist

### Before Going Live:

1. **Rotate Development Keys**

   ```bash
   # Generate new anon key in Supabase dashboard
   # Update production .env
   ```

2. **Use Separate Supabase Projects**

   - Development: `dev-project.supabase.co`
   - Production: `prod-project.supabase.co`

3. **Set Environment Variables in Hosting Platform**

   - Don't rely on `.env` file in production
   - Use platform's secrets management

4. **Enable RLS on All Tables**

   ```sql
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
   ```

5. **Verify RLS Policies**

   - Test with different user roles
   - Ensure users can't access others' data

6. **Rate Limit API Endpoints**

   ```typescript
   // Use Nuxt middleware
   export default defineEventHandler((event) => {
     // Add rate limiting
   });
   ```

7. **Monitor Suspicious Activity**
   - Check Supabase logs
   - Set up alerts for failed auth attempts

---

## What If Secrets Are Exposed?

### If You Accidentally Commit `.env` to Git:

1. **Immediately rotate all keys**

   ```bash
   # Go to Supabase Dashboard
   # Settings → API → Generate new anon key
   ```

2. **Remove from Git history**

   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all

   git push origin --force --all
   ```

3. **Or use BFG Repo-Cleaner** (easier):

   ```bash
   bfg --delete-files .env
   git push origin --force --all
   ```

4. **Consider repository as compromised**
   - Create new repository
   - Copy code (not git history)
   - Use new credentials

---

## FAQ

### Q: Is the anon key in my JavaScript a security risk?

**A:** No! The anon key is **designed** to be public. It's protected by:

- Row Level Security (RLS) policies
- Can only access what your policies allow
- Cannot bypass security rules

### Q: When should I upgrade to server-side API?

**A:** When you:

- Go to production
- Handle sensitive user data
- Need rate limiting
- Want more control over requests

### Q: Can someone steal my database with the anon key?

**A:** No! The anon key:

- Cannot bypass RLS
- Cannot access restricted data
- Cannot delete data (unless policy allows)
- Cannot modify schema

### Q: What's the most important security practice?

**A:** **Enable and test Row Level Security (RLS)** on all tables!

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);
```

---

## Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Nuxt Runtime Config](https://nuxt.com/docs/guide/going-further/runtime-config)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)

---

## Current Status ✅

Your app is currently **secure for development**:

✅ Secrets not in git  
✅ Using public anon key (safe)  
✅ RLS enabled and tested  
✅ Edge Function secrets in Supabase  
✅ No service role keys exposed

**Recommended next step for production:**
→ Implement Level 2 (Server-Side API) before deploying
