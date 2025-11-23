# Kiki Packaging Backoffice

A modern backoffice application for Kiki Packaging, built with Nuxt 4, Vue 3, and Supabase.

## 🚀 Features

### Authentication & User Management

- ✅ Supabase Authentication (Email/Password)
- ✅ User Profiles with Roles (Admin/Staff)
- ✅ Email-based User Invitations
- ✅ Auto-login after invitation acceptance
- ✅ Profile restoration on page refresh
- ✅ RLS (Row Level Security) policies

### User Invitation System

- ✅ Admin-only invitation sending
- ✅ Email delivery via Resend API
- ✅ Token-based invitation links (7-day expiry)
- ✅ Resend and revoke invitations
- ✅ Pending invitations management
- ✅ Duplicate prevention (pending & accepted)

### UI/UX

- ✅ Internationalization (EN/TH)
- ✅ Responsive design (Mobile/Tablet/Desktop)
- ✅ Loading states and spinners
- ✅ Toast notifications
- ✅ Custom reusable components
- ✅ Tailwind CSS styling

### Tech Stack

- **Framework**: Nuxt 4
- **UI**: Vue 3 + Nuxt UI
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Email**: Resend API (via Edge Functions)
- **i18n**: @nuxtjs/i18n
- **Icons**: Heroicons
- **TypeScript**: Full type safety

## 📋 Prerequisites

- Node.js 18+ or Bun
- Yarn package manager
- Supabase account
- Resend account (for email sending)

## 🛠️ Setup

### 1. Install Dependencies

```bash
yarn install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# App Configuration
NUXT_PUBLIC_APP_NAME="Kiki Packaging Backoffice"

# API Configuration
NUXT_PUBLIC_API_BASE_URL=https://api.example.com
NUXT_PUBLIC_API_TOKEN=

# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Email Configuration (set as Supabase secrets, not in .env)
# RESEND_API_KEY=re_xxxxxxxxxxxxx
# APP_URL=http://localhost:3000
```

### 3. Database Setup

Run the database schema in Supabase SQL Editor:

```bash
# The schema is located in:
docs/database/schema.sql
```

This creates:

- `user_profiles` table
- `user_invitations` table
- RLS policies
- `is_admin()` security function
- Triggers for updated_at

### 4. Supabase Edge Function Setup

Install Supabase CLI:

```bash
npm install -g supabase
```

Login and link your project:

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

Set environment secrets:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set APP_URL=http://localhost:3000
```

Deploy the email function:

```bash
supabase functions deploy send-invitation-email
```

For detailed email setup, see: `docs/EMAIL_SETUP.md`

## 🚀 Development

Start the development server on `http://localhost:3000`:

```bash
yarn dev
```

## 🧪 Testing

Follow the comprehensive testing guide:

```bash
# See testing scenarios and checklist
docs/INVITATION_TESTING.md
```

Test scenarios include:

- Complete invitation flow
- Resend/revoke invitations
- Expired tokens
- Duplicate prevention
- Password validation
- Profile loading
- Logout flow

## 🏗️ Production

Build the application for production:

```bash
yarn build
```

Preview production build:

```bash
yarn preview
```

### Production Checklist

- [ ] Update `APP_URL` secret to production URL
- [ ] Verify custom domain in Resend
- [ ] Update email "from" address with verified domain
- [ ] Test all invitation flows in production
- [ ] Regenerate Supabase types (optional):
  ```bash
  supabase gen types typescript --linked > types/supabase.ts
  ```

## 📁 Project Structure

```
kiki-packaging/
├── app/
│   ├── components/          # Reusable Vue components
│   │   ├── GlobalLoadingOverlay.vue
│   │   ├── Header.vue
│   │   ├── MyButton.vue
│   │   ├── MyTextField.vue
│   │   └── Sidebar.vue
│   ├── composables/         # Vue composables
│   │   ├── useApi.ts
│   │   ├── useAuth.ts
│   │   ├── useInvitations.ts  # Invitation system logic
│   │   └── useSupabase.ts
│   ├── layouts/             # Nuxt layouts
│   │   ├── auth.vue
│   │   └── default.vue
│   ├── middleware/          # Route middleware
│   │   └── auth.global.ts
│   ├── pages/               # Application pages
│   │   ├── accept-invitation.vue  # Invitation acceptance
│   │   ├── dashboard.vue
│   │   ├── login.vue
│   │   └── users.vue        # User management
│   └── plugins/
│       └── auth.client.ts   # Auth restoration plugin
├── docs/
│   ├── database/
│   │   └── schema.sql       # Database schema
│   ├── EMAIL_SETUP.md       # Email setup guide
│   └── INVITATION_TESTING.md # Testing guide
├── i18n/
│   └── locales/
│       ├── en.json          # English translations
│       └── th.json          # Thai translations
├── public/
├── supabase/
│   └── functions/
│       └── send-invitation-email/
│           └── index.ts     # Edge Function
└── nuxt.config.ts
```

## 🔑 Key Features

### User Invitation Flow

1. **Admin sends invitation**

   - Navigate to Users page
   - Click "Invite User"
   - Fill name, email, role
   - System sends email via Resend

2. **User receives email**

   - Email contains invitation link
   - Link expires in 7 days
   - Branded HTML template

3. **User accepts invitation**

   - Click link → `/accept-invitation?token=xxx`
   - Set password
   - Auto-login to dashboard

4. **Invitation management**
   - View pending invitations
   - Resend (extends expiry)
   - Revoke (deletes invitation)

### Authentication Flow

- **Login**: Email/Password → Fetch profile → Redirect to dashboard
- **Refresh**: Auth plugin restores profile from Supabase session
- **Logout**: Clear tokens → Clear profile → Redirect to login

## 🔒 Security

- Row Level Security (RLS) on all tables
- `is_admin()` security definer function prevents RLS recursion
- Token-based invitation with 7-day expiry
- One-time use tokens (marked as accepted)
- Admin-only access to user management
- Partial unique index prevents duplicate pending invitations

## 📧 Email Configuration

### Resend Free Tier

- 100 emails/day, 3,000/month
- Requires domain verification for custom sender
- Default sender: `onboarding@resend.dev`

### Custom Domain (Production)

1. Add domain in [Resend Dashboard](https://resend.com/domains)
2. Add DNS records to verify
3. Update Edge Function `from` address
4. Redeploy function

## 🐛 Known Issues

### TypeScript Warnings

- Supabase type errors in `useInvitations.ts` and `users.vue`
- These are cosmetic - code works at runtime
- Fix by regenerating types: `supabase gen types typescript --linked`

### Edge Function Deno Errors

- VS Code shows errors in `send-invitation-email/index.ts`
- Expected - Deno code, not Node.js
- Function works correctly when deployed

## 📚 Documentation

- [Email Setup Guide](docs/EMAIL_SETUP.md)
- [Testing Guide](docs/INVITATION_TESTING.md)
- [Database Schema](docs/database/schema.sql)
- [Supabase Edge Functions](supabase/functions/README.md)

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly (see `docs/INVITATION_TESTING.md`)
4. Submit pull request

## 📝 License

Private - Kiki Packaging Internal Use Only

## 🆘 Support

For issues or questions:

1. Check documentation in `docs/`
2. Review testing guide for common scenarios
3. Check Supabase logs for Edge Function errors
4. Verify Resend email delivery logs

---

Built with ❤️ using Nuxt 4 and Supabase
