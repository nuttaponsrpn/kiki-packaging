/**
 * Activity Logs Composable
 * Provides functions for logging all user activities in the system
 */

import type { UserProfile } from "~/types/user";

export interface ActivityLog {
  id: string;
  user_id: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "login"
    | "logout"
    | "invite"
    | "accept_invitation"
    | "cancel"
    | "reactivate"
    | "status_change"
    | "delete_item";
  entity_type: "packaging" | "order" | "user" | "invitation" | "auth";
  entity_id?: string;
  entity_name?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    name: string;
  };
}

export const useActivityLogs = () => {
  const supabase = useSupabase();
  const userProfile = useState<UserProfile | null>("userProfile");

  /**
   * Log an activity
   */
  const logActivity = async (params: {
    action: ActivityLog["action"];
    entity_type: ActivityLog["entity_type"];
    entity_id?: string;
    entity_name?: string;
    details?: Record<string, unknown>;
  }): Promise<{ success: boolean; error?: unknown }> => {
    try {
      if (!userProfile.value) {
        return { success: false, error: "User not authenticated" };
      }

      // @ts-expect-error - Supabase type inference issue with activity_logs table
      const { error } = await supabase.from("activity_logs").insert({
        user_id: userProfile.value.id,
        action: params.action,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        entity_name: params.entity_name,
        details: params.details,
      });

      if (error) {
        console.error("Error logging activity:", error);
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      console.error("Error logging activity:", error);
      return { success: false, error };
    }
  };

  /**
   * Get all activity logs (admin only)
   */
  const getAllActivityLogs = async (params?: {
    limit?: number;
    offset?: number;
    action?: string;
    entity_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data: ActivityLog[]; count?: number; error?: unknown }> => {
    try {
      let query = supabase
        .from("activity_logs")
        .select(
          `
          *,
          user:user_profiles(name)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (params?.action) {
        query = query.eq("action", params.action);
      }
      if (params?.entity_type) {
        query = query.eq("entity_type", params.entity_type);
      }
      if (params?.user_id) {
        query = query.eq("user_id", params.user_id);
      }
      if (params?.start_date) {
        query = query.gte("created_at", params.start_date);
      }
      if (params?.end_date) {
        query = query.lte("created_at", params.end_date);
      }

      // Apply pagination
      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching activity logs:", error);
        return { success: false, data: [], error };
      }

      return { success: true, data: data || [], count: count || 0 };
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      return { success: false, data: [], error };
    }
  };

  /**
   * Get activity logs for current user
   */
  const getMyActivityLogs = async (params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ success: boolean; data: ActivityLog[]; error?: unknown }> => {
    try {
      if (!userProfile.value) {
        return { success: false, data: [], error: "User not authenticated" };
      }

      let query = supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userProfile.value.id)
        .order("created_at", { ascending: false });

      if (params?.limit) {
        query = query.limit(params.limit);
      }
      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching my activity logs:", error);
        return { success: false, data: [], error };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching my activity logs:", error);
      return { success: false, data: [], error };
    }
  };

  /**
   * Get recent activity for dashboard
   */
  const getRecentActivity = async (
    limit: number = 10
  ): Promise<{ success: boolean; data: ActivityLog[]; error?: unknown }> => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          user:user_profiles(name)
        `
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent activity:", error);
        return { success: false, data: [], error };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return { success: false, data: [], error };
    }
  };

  /**
   * Get activity logs for specific entity
   */
  const getEntityActivityLogs = async (
    entity_type: ActivityLog["entity_type"],
    entity_id: string
  ): Promise<{ success: boolean; data: ActivityLog[]; error?: unknown }> => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          user:user_profiles(name)
        `
        )
        .eq("entity_type", entity_type)
        .eq("entity_id", entity_id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching entity activity logs:", error);
        return { success: false, data: [], error };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error("Error fetching entity activity logs:", error);
      return { success: false, data: [], error };
    }
  };

  /**
   * Get activity statistics
   */
  const getActivityStats = async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    success: boolean;
    data: {
      total_activities: number;
      by_action: Record<string, number>;
      by_entity_type: Record<string, number>;
      by_user: Array<{ user_id: string; user_name: string; count: number }>;
    };
    error?: unknown;
  }> => {
    try {
      let query = supabase.from("activity_logs").select("*");

      if (params?.start_date) {
        query = query.gte("created_at", params.start_date);
      }
      if (params?.end_date) {
        query = query.lte("created_at", params.end_date);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching activity stats:", error);
        return {
          success: false,
          data: {
            total_activities: 0,
            by_action: {},
            by_entity_type: {},
            by_user: [],
          },
          error,
        };
      }

      const logs = data || [];

      // Calculate statistics
      const stats = {
        total_activities: logs.length,
        by_action: {} as Record<string, number>,
        by_entity_type: {} as Record<string, number>,
        by_user: [] as Array<{ user_id: string; user_name: string; count: number }>,
      };

      logs.forEach((log: ActivityLog) => {
        // Count by action
        stats.by_action[log.action] = (stats.by_action[log.action] || 0) + 1;

        // Count by entity type
        stats.by_entity_type[log.entity_type] = (stats.by_entity_type[log.entity_type] || 0) + 1;
      });

      return { success: true, data: stats };
    } catch (error) {
      console.error("Error fetching activity stats:", error);
      return {
        success: false,
        data: {
          total_activities: 0,
          by_action: {},
          by_entity_type: {},
          by_user: [],
        },
        error,
      };
    }
  };

  return {
    logActivity,
    getAllActivityLogs,
    getMyActivityLogs,
    getRecentActivity,
    getEntityActivityLogs,
    getActivityStats,
  };
};
