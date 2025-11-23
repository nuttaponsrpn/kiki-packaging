# User Invitation System - Testing Guide

## Prerequisites

✅ Supabase Edge Function deployed
✅ Resend API key configured
✅ Database schema deployed
✅ App running on localhost:3000

## Test Scenarios

### 1. Happy Path - Complete Invitation Flow

**Steps:**

1. Login as admin user
2. Navigate to Users page
3. Click "Invite User" button
4. Fill in invitation form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Role: "staff"
5. Click "Send Invitation"

**Expected Results:**

- ✅ Success toast: "Invitation sent successfully"
- ✅ Email sent to test@example.com
- ✅ Pending invitation appears in table
- ✅ Shows: name, email, role, sent date, expires date
- ✅ Resend and Revoke buttons visible

**Email Verification:** 6. Check email inbox 7. Verify email contains:

- ✅ Subject: "You've been invited to join Kiki Packaging"
- ✅ Personalized greeting: "Hi Test User"
- ✅ "Accept Invitation" button
- ✅ Fallback URL for copy/paste
- ✅ "Expires in 7 days" notice

**Accept Invitation:** 8. Click "Accept Invitation" button in email 9. Should redirect to: `/accept-invitation?token=xxx` 10. Verify page shows: - ✅ Welcome message with user's name - ✅ Password input fields - ✅ Password confirmation field

11. Set password:
    - Password: "SecurePass123!"
    - Confirm: "SecurePass123!"
12. Click "Accept Invitation"

**Expected Results:**

- ✅ Success toast: "Welcome! Your account has been created."
- ✅ Auto-login (no manual login required)
- ✅ Redirect to `/dashboard`
- ✅ User profile loaded in header
- ✅ User can navigate app normally

**Verification:** 13. Go back to Users page (as admin) 14. Verify: - ✅ Pending invitation no longer shows - ✅ New user appears in active users table - ✅ User has correct name, email, role

---

### 2. Resend Invitation

**Steps:**

1. Login as admin
2. Go to Users page
3. Find pending invitation
4. Click "Resend" button

**Expected Results:**

- ✅ Success toast: "Invitation resent"
- ✅ New email sent to user
- ✅ Expires date extended by 7 days
- ✅ Same invitation token (URL unchanged)

---

### 3. Revoke Invitation

**Steps:**

1. Login as admin
2. Go to Users page
3. Find pending invitation
4. Click "Revoke" button
5. Confirm in modal

**Expected Results:**

- ✅ Success toast: "Invitation revoked"
- ✅ Invitation removed from pending table
- ✅ Original invitation link no longer works

**Verify Revoked Link:** 6. Try to visit original invitation URL 7. Should see error: "Invalid or expired token"

---

### 4. Edge Case - Expired Token

**Setup:**

1. Manually update invitation in database:
   ```sql
   UPDATE user_invitations
   SET expires_at = NOW() - INTERVAL '1 day'
   WHERE email = 'test@example.com';
   ```

**Steps:** 2. Visit invitation URL 3. Try to accept invitation

**Expected Results:**

- ✅ Error message: "This invitation has expired"
- ✅ Cannot set password
- ✅ No account created

---

### 5. Edge Case - Duplicate Pending Invitation

**Steps:**

1. Login as admin
2. Send invitation to "duplicate@example.com"
3. Try to send another invitation to same email

**Expected Results:**

- ✅ Error toast: "An invitation has already been sent to this email"
- ✅ No duplicate invitation created
- ✅ Original invitation still valid

---

### 6. Edge Case - Password Mismatch

**Steps:**

1. Visit valid invitation URL
2. Enter password: "Password123!"
3. Enter confirmation: "DifferentPassword!"
4. Click "Accept Invitation"

**Expected Results:**

- ✅ Error message: "Passwords do not match"
- ✅ Form not submitted
- ✅ No account created

---

### 7. Edge Case - Already Accepted

**Setup:**

1. Accept an invitation normally
2. Try to visit the same invitation URL again

**Expected Results:**

- ✅ Error message: "This invitation has already been accepted"
- ✅ Cannot create duplicate account

---

### 8. Edge Case - Invalid Token

**Steps:**

1. Visit: `/accept-invitation?token=invalid-token-12345`

**Expected Results:**

- ✅ Error message: "Invalid invitation token"
- ✅ Cannot proceed

---

### 9. Email Sending Failure

**Setup:**

1. Temporarily set invalid Resend API key:
   ```bash
   supabase secrets set RESEND_API_KEY=invalid_key
   ```

**Steps:** 2. Try to send invitation

**Expected Results:**

- ✅ Warning toast: "Invitation created but email failed to send"
- ✅ Invitation still created in database
- ✅ Admin can manually copy invitation link to send

**Cleanup:** 3. Reset correct API key:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
```

---

### 10. Permission Check - Non-Admin User

**Steps:**

1. Login as staff user (not admin)
2. Navigate to `/users`

**Expected Results:**

- ✅ Error toast: "Admin access required"
- ✅ No "Invite User" button visible
- ✅ Cannot access user management

---

### 11. Profile Loading on Refresh

**Steps:**

1. Login successfully
2. Navigate to any page
3. Press F5 to refresh

**Expected Results:**

- ✅ Loading overlay appears immediately
- ✅ Shows spinner: "Loading your profile..."
- ✅ Page stays blocked during load
- ✅ Profile restored from Supabase
- ✅ Overlay disappears (300ms delay)
- ✅ User remains logged in

---

### 12. Logout Flow

**Steps:**

1. Login as any user
2. Click user menu in header
3. Click "Logout"

**Expected Results:**

- ✅ Success toast: "Logged out successfully"
- ✅ Redirect to `/login`
- ✅ User profile cleared
- ✅ Auth tokens cleared
- ✅ Cannot access protected pages

---

## Database Verification Queries

### Check Pending Invitations

```sql
SELECT email, name, role, expires_at, accepted_at, created_at
FROM user_invitations
WHERE accepted_at IS NULL;
```

### Check Accepted Invitations

```sql
SELECT ui.email, ui.name, ui.accepted_at, up.role
FROM user_invitations ui
JOIN user_profiles up ON ui.email = (SELECT email FROM auth.users WHERE id = up.id)
WHERE ui.accepted_at IS NOT NULL;
```

### Check User Profiles

```sql
SELECT id, name, role, is_active, created_at
FROM user_profiles
ORDER BY created_at DESC;
```

### Manually Expire an Invitation (for testing)

```sql
UPDATE user_invitations
SET expires_at = NOW() - INTERVAL '1 day'
WHERE email = 'test@example.com'
AND accepted_at IS NULL;
```

---

## Known Issues & Notes

### Resend Free Tier Limitations

- Can only send emails **from** `onboarding@resend.dev` (unless domain verified)
- Can send **to** any email address
- Free tier: 100 emails/day, 3,000/month
- To use custom domain: Verify at https://resend.com/domains

### Supabase Type Errors

- TypeScript shows errors in `useInvitations.ts` and `users.vue`
- These are cosmetic - code works fine at runtime
- To fix: Run `supabase gen types typescript --linked > types/supabase.ts`

### Edge Function Errors (Deno)

- VS Code shows errors in `supabase/functions/send-invitation-email/index.ts`
- These are expected - it's Deno code, not Node.js
- Function works correctly when deployed

---

## Success Criteria

✅ **Complete Flow Works:**

- Admin can send invitations
- Users receive emails
- Users can accept and set passwords
- Users auto-login after acceptance
- New users appear in system

✅ **Security:**

- Non-admins cannot access user management
- Expired tokens rejected
- Already-accepted tokens rejected
- Invalid tokens rejected

✅ **UX:**

- Loading states show properly
- Error messages clear and helpful
- Success feedback immediate
- Profile restoration on refresh works

✅ **Email Delivery:**

- Emails arrive within 1 minute
- Email content correct and branded
- Invitation links work
- Expiry notice clear

---

## Cleanup After Testing

```sql
-- Remove test invitations
DELETE FROM user_invitations WHERE email LIKE '%test%';

-- Remove test users (careful!)
-- First get their IDs
SELECT id FROM user_profiles WHERE name LIKE '%Test%';

-- Then delete (replace with actual IDs)
DELETE FROM user_profiles WHERE id = 'user-id-here';
```

---

## Next Steps After Testing

1. ✅ Verify all test scenarios pass
2. ✅ Document any bugs found
3. ✅ Fix critical issues
4. ✅ Optional: Verify custom domain in Resend
5. ✅ Optional: Regenerate Supabase types
6. ✅ Deploy to production
7. ✅ Test production environment
8. ✅ Train admins on invitation workflow
