# Email Invitation Setup Guide

## Quick Start

### 1. Get Resend API Key

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email
3. Get your API key from the dashboard
4. (Optional) Add and verify your custom domain for professional emails

### 2. Deploy the Edge Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (get project-ref from Supabase dashboard URL)
supabase link --project-ref <your-project-ref>

# Set environment variables
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set APP_URL=https://yourapp.com  # or http://localhost:3000 for local

# Deploy the function
supabase functions deploy send-invitation-email
```

### 3. Update Email "From" Address

Edit `supabase/functions/send-invitation-email/index.ts`:

```typescript
from: "Kiki Packaging <noreply@yourdomain.com>", // Replace with your verified domain
```

If you haven't verified a domain yet, you can use Resend's test domain:

```typescript
from: "Kiki Packaging <onboarding@resend.dev>",
```

### 4. Test It!

1. Go to your Users page
2. Click "Invite User"
3. Fill in the form
4. User should receive an email with invitation link
5. Click the link in the email to accept invitation

## Local Development Testing

### 1. Create Local Environment File

Create `supabase/.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
APP_URL=http://localhost:3000
```

### 2. Start Supabase Locally

```bash
supabase start
```

### 3. Serve the Function Locally

```bash
supabase functions serve send-invitation-email --env-file supabase/.env.local
```

### 4. Update Your Nuxt Config

The function will be available at:

- Local: `http://localhost:54321/functions/v1/send-invitation-email`
- Production: `https://<project-ref>.supabase.co/functions/v1/send-invitation-email`

The Supabase client automatically uses the correct URL based on your environment.

## Email Customization

### Edit Email Template

The email template is in `supabase/functions/send-invitation-email/index.ts`.

You can customize:

- Subject line
- HTML content
- Styling
- Branding

### Add Your Logo

```html
<div style="text-align: center; margin-bottom: 20px;">
  <img src="https://yourcdn.com/logo.png" alt="Kiki Packaging" style="max-width: 200px;" />
</div>
```

### Change Colors

Update the color values in the HTML:

- Primary button: `#4f46e5` (indigo)
- Text: `#2d3748` (dark gray)
- Links: `#4f46e5` (indigo)

## Troubleshooting

### Email Not Sending

1. **Check function logs:**

   ```bash
   supabase functions logs send-invitation-email
   ```

2. **Verify API key is set:**

   ```bash
   supabase secrets list
   ```

3. **Check Resend dashboard** for delivery status

### "From" Email Rejected

- Use Resend's test domain: `onboarding@resend.dev`
- Or verify your own domain in Resend settings

### Function Not Found

- Make sure you deployed: `supabase functions deploy send-invitation-email`
- Check project is linked: `supabase link --project-ref <ref>`

## Alternative Email Services

### Using SendGrid

1. Get SendGrid API key
2. Update the fetch call in `index.ts`:

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

### Using Mailgun

```typescript
const formData = new FormData();
formData.append("from", "Kiki Packaging <noreply@yourdomain.com>");
formData.append("to", email);
formData.append("subject", "You've been invited to join Kiki Packaging");
formData.append("html", htmlContent);

const res = await fetch(`https://api.mailgun.net/v3/<your-domain>/messages`, {
  method: "POST",
  headers: {
    Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
  },
  body: formData,
});
```

## Production Checklist

- [ ] Verify domain in Resend
- [ ] Update "from" email address
- [ ] Set APP_URL to production URL
- [ ] Deploy Edge Function
- [ ] Test end-to-end invitation flow
- [ ] Monitor function logs for errors
- [ ] Set up email delivery notifications in Resend
