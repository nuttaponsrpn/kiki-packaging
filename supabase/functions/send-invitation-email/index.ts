import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface InvitationEmailRequest {
  email: string;
  name: string;
  inviteToken: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Parse request body
    const { email, name, inviteToken }: InvitationEmailRequest = await req.json();

    if (!email || !name || !inviteToken) {
      throw new Error("Missing required fields: email, name, or inviteToken");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }

    // Get app URL from environment or use default
    const appUrl = "https://kiki-packaging.vercel.app";
    const invitationUrl = `${appUrl}/accept-invitation?token=${inviteToken}`;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kiki Packaging <no-reply@mail.kikicheesecake.com>",
        to: email,
        subject: "You've been invited to join Kiki Packaging",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invitation to Kiki Packaging</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f7fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
                <h1 style="color: #2d3748; margin-top: 0;">Welcome to Kiki Packaging!</h1>
                <p style="font-size: 16px; color: #4a5568;">Hi ${name},</p>
                <p style="font-size: 16px; color: #4a5568;">
                  You've been invited to join the Kiki Packaging team. Click the button below to accept your invitation and set up your account.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${invitationUrl}" 
                     style="background-color: #4f46e5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                    Accept Invitation
                  </a>
                </div>
                <p style="font-size: 14px; color: #718096;">
                  Or copy and paste this URL into your browser:
                </p>
                <p style="font-size: 14px; color: #4f46e5; word-break: break-all;">
                  ${invitationUrl}
                </p>
                <p style="font-size: 14px; color: #718096; margin-top: 30px;">
                  This invitation will expire in 7 days.
                </p>
              </div>
              <div style="text-align: center; color: #a0aec0; font-size: 12px;">
                <p>
                  If you didn't expect this invitation, you can safely ignore this email.
                </p>
                <p>
                  © ${new Date().getFullYear()} Kiki Packaging. All rights reserved.
                </p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
