export const useInvitations = () => {
  const supabase = useSupabase();
  const { $toast } = useNuxtApp();
  const { t } = useI18n();

  /**
   * Send an invitation to a new user
   */
  const sendInvitation = async (data: { email: string; name: string; role: "admin" | "staff" }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("User not authenticated");
      }

      // Check for existing pending invitation
      const { data: pendingInvites } = await supabase
        .from("user_invitations")
        .select("id")
        .eq("email", data.email)
        .is("accepted_at", null);

      if (pendingInvites && pendingInvites.length > 0) {
        $toast.error(t("invitations.alreadyInvited"));
        return { success: false, error: "Invitation already exists" };
      }

      // Create invitation
      const { data: invitation, error } = await supabase
        .from("user_invitations")
        .insert({
          email: data.email,
          name: data.name,
          role: data.role,
          invited_by: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Send email via Edge Function
      try {
        const { error: emailError } = await supabase.functions.invoke("send-invitation-email", {
          body: { email: data.email, name: data.name, inviteToken: invitation.invite_token },
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
          $toast.warning("Invitation created but email failed to send");
        } else {
          $toast.success(t("invitations.invitationSent"));
        }
      } catch (emailError) {
        console.error("Email function error:", emailError);
      }

      return { success: true, data: invitation };
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      $toast.error(t("invitations.sendError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Validate an invitation token
   */
  const validateToken = async (token: string) => {
    try {
      const { data: invitation, error }: any = await supabase
        .from("user_invitations")
        .select("*")
        .eq("invite_token", token)
        .is("accepted_at", null)
        .single();

      if (error || !invitation) {
        return { valid: false, error: "Invalid token" };
      }

      // Check if expired
      const expiresAt = new Date(invitation.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        return { valid: false, error: "Token expired" };
      }

      return { valid: true, invitation };
    } catch (error: any) {
      console.error("Error validating token:", error);
      return { valid: false, error: error.message };
    }
  };

  /**
   * Accept an invitation and create user account
   */
  const acceptInvitation = async (token: string, password: string) => {
    try {
      // Validate token first
      const validation: any = await validateToken(token);
      if (!validation.valid || !validation.invitation) {
        $toast.error(t("invitations.invalidToken"));
        return { success: false, error: validation.error };
      }

      const invitation = validation.invitation;

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            name: invitation.name,
          },
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Create user profile
      const { error: profileError }: any = await supabase.from("user_profiles").insert({
        id: authData.user.id,
        name: invitation.name,
        role: invitation.role,
      });

      if (profileError) throw profileError;

      // Mark invitation as accepted
      const { error: updateError }: any = await supabase
        .from("user_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password: password,
      });

      if (signInError) throw signInError;

      // Set user profile state
      const userProfile = useState<{ id: string; name: string; email: string; role: string }>(
        "userProfile"
      );

      userProfile.value = {
        id: authData.user.id,
        name: invitation.name,
        email: invitation.email,
        role: invitation.role,
      };

      // Save tokens
      const auth = useAuth();
      if (signInData.session) {
        auth.saveTokens({
          access_token: signInData.session.access_token,
          access_token_expires_at: new Date(signInData.session.expires_at! * 1000).toISOString(),
          refresh_token: signInData.session.refresh_token,
          refresh_token_expires_at: new Date(
            (signInData.session.expires_at! + 86400) * 1000
          ).toISOString(),
          token_type: signInData.session.token_type,
        });
      }

      $toast.success(t("invitations.acceptSuccess"));
      return { success: true, user: authData.user };
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      $toast.error(t("invitations.acceptError"), error.message);
      return { success: false, error: error.message };
    }
  };

  /**
   * Revoke (delete) a pending invitation
   */
  const revokeInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase.from("user_invitations").delete().eq("id", invitationId);

      if (error) throw error;

      $toast.success(t("invitations.revokeSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error revoking invitation:", error);
      $toast.error(t("invitations.revokeError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Resend an invitation (update expires_at)
   */
  const resendInvitation = async (invitationId: string) => {
    try {
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      const { error } = await supabase
        .from("user_invitations")
        .update({ expires_at: newExpiresAt.toISOString() })
        .eq("id", invitationId);

      if (error) throw error;

      $toast.success(t("invitations.resendSuccess"));
      return { success: true };
    } catch (error: any) {
      console.error("Error resending invitation:", error);
      $toast.error(t("invitations.resendError"));
      return { success: false, error: error.message };
    }
  };

  /**
   * Get all pending invitations (admin only)
   */
  const getPendingInvitations = async () => {
    try {
      const { data: invitations, error } = await supabase
        .from("user_invitations")
        .select(
          `
          *,
          inviter:invited_by (
            id,
            name
          )
        `
        )
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { success: true, data: invitations || [] };
    } catch (error: any) {
      console.error("Error fetching invitations:", error);
      return { success: false, data: [], error: error.message };
    }
  };

  return {
    sendInvitation,
    validateToken,
    acceptInvitation,
    revokeInvitation,
    resendInvitation,
    getPendingInvitations,
  };
};
