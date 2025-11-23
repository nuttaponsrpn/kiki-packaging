# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Kiki Packaging application.

## Functions

### send-invitation-email

Sends invitation emails to new users using Resend email service.

**Endpoint:** `https://<project-ref>.supabase.co/functions/v1/send-invitation-email`

**Request Body:**

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "inviteToken": "uuid-token-here"
}
```

**Environment Variables Required:**

- `RESEND_API_KEY` - Your Resend API key
- `APP_URL` - Your application URL (e.g., https://yourapp.com)
- `SUPABASE_URL` - Auto-provided by Supabase
- `SUPABASE_ANON_KEY` - Auto-provided by Supabase

## Deployment

### Prerequisites

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Link your project:

```bash
supabase link --project-ref <your-project-ref>
```

### Set Environment Variables

Set your secrets in Supabase:

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Set your app URL (production)
supabase secrets set APP_URL=https://yourapp.com
```

### Deploy the Function

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific function
supabase functions deploy send-invitation-email
```

### Test the Function Locally

1. Start Supabase locally:

```bash
supabase start
```

2. Serve the function:

```bash
supabase functions serve send-invitation-email --env-file supabase/.env.local
```

3. Create `.env.local` file in `supabase/` directory:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
APP_URL=http://localhost:3000
```

4. Test with curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-invitation-email' \
  --header 'Authorization: Bearer <your-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","name":"Test User","inviteToken":"test-token-123"}'
```

## Email Service Setup

### Using Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain or use their test domain
3. Get your API key from the dashboard
4. Update the `from` field in `index.ts`:

```typescript
from: "Your App <noreply@yourdomain.com>", // Replace with your verified domain
```

### Alternative: Using SendGrid

If you prefer SendGrid, replace the Resend API call with:

```typescript
const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SENDGRID_API_KEY}`,
  },
  body: JSON.stringify({
    personalizations: [
      {
        to: [{ email }],
        subject: "You've been invited to join Kiki Packaging",
      },
    ],
    from: { email: "noreply@yourdomain.com", name: "Kiki Packaging" },
    content: [
      {
        type: "text/html",
        value: htmlContent,
      },
    ],
  }),
});
```

## Security

- Function requires authentication (Authorization header)
- Only authenticated users can send invitations
- CORS is configured for secure cross-origin requests
- Email sending is rate-limited by your email provider

## Monitoring

View function logs in Supabase Dashboard:

1. Go to Edge Functions
2. Select `send-invitation-email`
3. Click on "Logs" tab

Or use CLI:

```bash
supabase functions logs send-invitation-email
```
