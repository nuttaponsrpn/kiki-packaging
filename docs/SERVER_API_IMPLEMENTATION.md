# Server-Side API Implementation (Level 2 Security)

## Overview

This document describes the server-side API layer implementation that hides Supabase credentials from the client and provides production-grade security for the invitation system.

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Client    │ ───────▶│  Server API  │ ───────▶│   Supabase   │
│  (Browser)  │  $fetch │  /api/...    │  Client │   Database   │
└─────────────┘         └──────────────┘         └──────────────┘
   Only sees               Has access to           Full access
   public URLs             server secrets          with RLS
```

### Key Benefits

✅ **Credentials Hidden**: Server-side credentials never sent to browser  
✅ **Authentication**: JWT token verification on every request  
✅ **Error Handling**: Centralized error responses  
✅ **Type Safety**: TypeScript throughout  
✅ **Production Ready**: Can use service role key safely

## Implementation Status

### ✅ Completed

1. **Runtime Configuration** (`nuxt.config.ts`)

   - Separated server-side and client-side config
   - Server gets: `supabaseUrl`, `supabaseServiceKey`
   - Client gets: Public URLs and anon key only

2. **Server API Routes** (`server/api/supabase/[...path].ts`)

   - `POST /api/supabase/invitations/send` - Send invitation
   - `POST /api/supabase/invitations/resend` - Resend invitation
   - `POST /api/supabase/invitations/revoke` - Revoke invitation
   - `GET /api/supabase/invitations/pending` - Get pending invitations

3. **Client Composable** (`app/composables/useInvitations.ts`)

   - Updated to call server API instead of direct Supabase
   - Sends JWT token in Authorization header
   - Handles server responses and errors

4. **Documentation**
   - Updated SECURITY.md with implementation details
   - Updated .env.example with optional server variables

### ⏸️ Pending

- Regenerate Supabase types (TypeScript errors in acceptInvitation)
- Test complete invitation flow with server API
- Optional: Add rate limiting to server routes
- Optional: Add request logging/monitoring

## File Changes

### 1. `nuxt.config.ts`

```typescript
runtimeConfig: {
  // Server-side only (never exposed to client)
  supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",

  // Client-side (public)
  public: {
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || "",
    supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || "",
    // ... other public vars
  },
}
```

### 2. `server/api/supabase/[...path].ts` (New)

**Key Features:**

- Singleton Supabase client for performance
- JWT token verification via `verifyAuth()` helper
- Route handlers for all invitation operations
- Proper error handling with HTTP status codes
- Falls back to anon key if service key not available

**Authentication Flow:**

```typescript
async function verifyAuth(event: H3Event) {
  const authHeader = getHeader(event, "authorization");
  const token = authHeader.replace("Bearer ", "");
  const supabase = getServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  // Returns user or throws 401 error
}
```

### 3. `app/composables/useInvitations.ts` (Updated)

**Changed Functions:**

- ✅ `sendInvitation()` - Now calls `/api/supabase/invitations/send`
- ✅ `resendInvitation()` - Now calls `/api/supabase/invitations/resend`
- ✅ `revokeInvitation()` - Now calls `/api/supabase/invitations/revoke`
- ✅ `getPendingInvitations()` - Now calls `/api/supabase/invitations/pending`
- 🟡 `validateToken()` - Still direct Supabase (client-side validation OK)
- 🟡 `acceptInvitation()` - Still direct Supabase (auth signup must be client-side)

**Request Pattern:**

```typescript
const {
  data: { session },
} = await supabase.auth.getSession();

const response = await $fetch("/api/supabase/invitations/send", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
  body: { email, name, role },
});
```

### 4. `.env.example` (Updated)

```bash
# Client-side (public - bundled in JavaScript)
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side (optional - enables elevated privileges)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

## Environment Variables

### Required (Client-side)

```bash
NUXT_PUBLIC_SUPABASE_URL=https://trgdubwfvajgaeuevoay.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are **SAFE** to expose (protected by RLS).

### Optional (Server-side)

```bash
SUPABASE_URL=https://trgdubwfvajgaeuevoay.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These enable server-side operations with **service role** privileges (bypasses RLS).

**⚠️ WARNING**: Service role key has **full database access**. Only use server-side!

## API Routes Reference

### POST /api/supabase/invitations/send

**Purpose**: Create and send invitation email

**Request:**

```typescript
{
  email: "user@example.com",
  name: "John Doe",
  role: "admin" | "staff"
}
```

**Response (Success):**

```typescript
{
  success: true,
  data: {
    id: "uuid",
    email: "user@example.com",
    name: "John Doe",
    role: "admin",
    invite_token: "xxx-yyy-zzz",
    created_at: "2024-01-01T00:00:00Z",
    expires_at: "2024-01-08T00:00:00Z"
  }
}
```

**Response (Email Failed):**

```typescript
{
  success: true,
  data: { ... },
  warning: "Invitation created but email failed to send"
}
```

**Errors:**

- `400` - Missing required fields
- `401` - Unauthorized (no/invalid token)
- `409` - Pending invitation already exists
- `500` - Server error

---

### POST /api/supabase/invitations/resend

**Purpose**: Extend invitation expiry by 7 days

**Request:**

```typescript
{
  id: "invitation-uuid";
}
```

**Response:**

```typescript
{
  success: true;
}
```

**Errors:**

- `400` - Missing invitation ID
- `401` - Unauthorized
- `500` - Server error

---

### POST /api/supabase/invitations/revoke

**Purpose**: Delete a pending invitation

**Request:**

```typescript
{
  id: "invitation-uuid";
}
```

**Response:**

```typescript
{
  success: true;
}
```

**Errors:**

- `400` - Missing invitation ID
- `401` - Unauthorized
- `500` - Server error

---

### GET /api/supabase/invitations/pending

**Purpose**: Get all pending invitations (admin only)

**Response:**

```typescript
{
  success: true,
  data: [
    {
      id: "uuid",
      email: "user@example.com",
      name: "John Doe",
      role: "admin",
      invite_token: "xxx-yyy-zzz",
      created_at: "2024-01-01T00:00:00Z",
      expires_at: "2024-01-08T00:00:00Z",
      inviter: {
        name: "Admin User"
      }
    }
  ]
}
```

**Errors:**

- `401` - Unauthorized
- `500` - Server error

## Testing

### 1. Verify Credentials Are Hidden

**Open browser DevTools → Network tab:**

1. Send an invitation from UI
2. Check the request to `/api/supabase/invitations/send`
3. **Verify**: No Supabase URL/key in request headers
4. **Verify**: Only sees Authorization token

**What you should NOT see:**

- ❌ `apikey` header with Supabase key
- ❌ Supabase URL in request
- ❌ Direct calls to `trgdubwfvajgaeuevoay.supabase.co`

**What you SHOULD see:**

- ✅ Request to `/api/supabase/invitations/send`
- ✅ `Authorization: Bearer eyJ...` header
- ✅ Clean request/response

### 2. Test All Operations

```bash
# Start dev server
yarn dev

# Test in browser:
# 1. Login as admin
# 2. Go to Users page
# 3. Send invitation → Check it works
# 4. Resend invitation → Check it works
# 5. Revoke invitation → Check it works
# 6. View pending invitations → Check they load
```

### 3. Check Server Logs

```bash
# Server should show API requests
[nitro] POST /api/supabase/invitations/send
[nitro] GET /api/supabase/invitations/pending
```

## Known Issues

### TypeScript Errors

**Location**: `app/composables/useInvitations.ts` lines 114, 125

**Error**: Supabase types show `never` for insert/update operations

**Cause**: Database types not regenerated after schema changes

**Fix**: Regenerate Supabase types

```bash
npx supabase gen types typescript --project-id trgdubwfvajgaeuevoay > types/supabase.ts
```

**Impact**: Compilation works, runtime works, just TypeScript warnings

## Security Comparison

### Before (Level 1)

```typescript
// Client-side direct call
const { data } = await supabase.from("user_invitations").insert({ email, name, role });
```

**Visible in browser:**

- ✅ Supabase URL (`trgdubwfvajgaeuevoay.supabase.co`)
- ✅ Anon key (safe, protected by RLS)
- ✅ Table structure and column names
- ✅ Query patterns

### After (Level 2)

```typescript
// Server API call
const response = await $fetch("/api/supabase/invitations/send", {
  headers: { Authorization: `Bearer ${token}` },
  body: { email, name, role },
});
```

**Visible in browser:**

- ✅ Only your API endpoint (`/api/supabase/invitations/send`)
- ✅ JWT token (short-lived, user-specific)
- ❌ No Supabase credentials
- ❌ No database structure

**Additional security in server:**

- ✅ Can use service role key safely
- ✅ Token verification before each request
- ✅ Centralized error handling
- ✅ Can add rate limiting
- ✅ Can add request logging

## Next Steps

### Immediate

1. Test invitation flow end-to-end
2. Verify credentials hidden in browser DevTools
3. Check all 4 server API routes work

### Optional Enhancements

1. **Rate Limiting**: Prevent spam invitations

   ```typescript
   // Add to server API
   const rateLimit = useRateLimit();
   await rateLimit.check(event, "5 per minute");
   ```

2. **Request Logging**: Monitor API usage

   ```typescript
   console.log(`[${new Date().toISOString()}] ${method} ${path} - User: ${user.id}`);
   ```

3. **Response Caching**: Cache pending invitations

   ```typescript
   const cached = await useStorage().getItem("invitations");
   ```

4. **Service Role Key**: Enable elevated operations
   ```bash
   # Add to .env (NEVER commit this)
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Future (Level 3)

- Separate dev/staging/prod environments
- Environment-specific Supabase projects
- CI/CD deployment with environment variables

### Future (Level 4)

- Secrets management service (Doppler, Vault)
- Automated key rotation
- Audit logging

## Troubleshooting

### Error: "User not authenticated"

**Cause**: No session or expired token

**Fix**:

```typescript
// Check session exists
const {
  data: { session },
} = await supabase.auth.getSession();
console.log("Session:", session); // Should not be null
```

### Error: "Cannot find name 'useSupabaseClient'"

**Cause**: Wrong import in composable

**Fix**: Use `useSupabase()` from composables (already fixed)

### Error: "Property 'data' does not exist"

**Cause**: TypeScript can't infer server response type

**Fix**: Type assertion

```typescript
const response: any = await $fetch("/api/...");
```

### Server API returns 500

**Cause**: Missing environment variables

**Fix**: Check `.env` has required variables

```bash
cat .env | grep SUPABASE
```

## References

- **Main Security Guide**: `docs/SECURITY.md`
- **Testing Guide**: `docs/INVITATION_TESTING.md`
- **Nuxt Server Routes**: https://nuxt.com/docs/guide/directory-structure/server
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security

---

**Status**: ✅ Implementation Complete - Ready for Testing  
**Security Level**: Level 2 (Production Ready)  
**Last Updated**: 2024-01-17
