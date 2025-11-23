/**
 * Authentication Composable
 * Handles token storage, retrieval, and user authentication state
 */

import type { UserProfile } from "~/types/user";

interface AuthTokens {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  token_type: string;
}

export const useAuth = () => {
  const TOKEN_KEY = "kiki_packaging_auth_tokens";

  // Access user profile state at top level to avoid circular dependency
  const userProfileState = useState<UserProfile | null>("userProfile");

  /**
   * Save authentication tokens to localStorage
   * @param tokens - The authentication tokens to save
   */
  const saveTokens = (tokens: AuthTokens): void => {
    if (import.meta.client) {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    }
  };

  /**
   * Get authentication tokens from localStorage
   * @returns AuthTokens | null - The stored tokens or null if not found
   */
  const getTokens = (): AuthTokens | null => {
    if (import.meta.client) {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) {
        try {
          return JSON.parse(stored) as AuthTokens;
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  /**
   * Get the current access token
   * @returns string | null - The access token or null if not found
   */
  const getAccessToken = (): string | null => {
    const tokens = getTokens();
    return tokens?.access_token || null;
  };

  /**
   * Get the current refresh token
   * @returns string | null - The refresh token or null if not found
   */
  const getRefreshToken = (): string | null => {
    const tokens = getTokens();
    return tokens?.refresh_token || null;
  };

  /**
   * Parse ISO date string ensuring UTC interpretation
   * @param dateString - ISO date string from server (assumed to be UTC)
   * @returns Date object or null if invalid
   */
  const parseUTCDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // If the date string doesn't end with 'Z', it's likely UTC without timezone indicator
    // Ensure it's treated as UTC by appending 'Z' if missing
    let utcDateString = dateString;
    if (!dateString.endsWith("Z") && !dateString.includes("+") && !dateString.includes("T")) {
      // Format: "2024-11-17 10:00:00" -> needs to be converted
      utcDateString = dateString.replace(" ", "T") + "Z";
    } else if (!dateString.endsWith("Z") && dateString.includes("T") && !dateString.includes("+")) {
      // Format: "2024-11-17T10:00:00" -> append Z
      utcDateString = dateString + "Z";
    }

    return new Date(utcDateString);
  };

  /**
   * Check if the access token is expired
   * @returns boolean - True if expired or not found, false otherwise
   */
  const isAccessTokenExpired = (): boolean => {
    const tokens = getTokens();
    if (!tokens?.access_token_expires_at) return true;

    // Parse the expiration time ensuring UTC interpretation
    const expiresAt = parseUTCDate(tokens.access_token_expires_at);
    if (!expiresAt) return true;

    // Get current time (always in UTC epoch)
    const now = new Date();

    // Compare timestamps (both are in milliseconds since epoch, timezone-independent)
    // Add 30 second buffer to refresh before actual expiration
    return now.getTime() >= expiresAt.getTime() - 30000;
  };

  /**
   * Check if the refresh token is expired
   * @returns boolean - True if expired or not found, false otherwise
   */
  const isRefreshTokenExpired = (): boolean => {
    const tokens = getTokens();
    if (!tokens?.refresh_token_expires_at) return true;

    // Parse the expiration time ensuring UTC interpretation
    const expiresAt = parseUTCDate(tokens.refresh_token_expires_at);
    if (!expiresAt) return true;

    // Get current time (always in UTC epoch)
    const now = new Date();

    // Compare timestamps (both are in milliseconds since epoch, timezone-independent)
    return now.getTime() >= expiresAt.getTime();
  };

  /**
   * Check if user is authenticated (has valid tokens)
   * @returns boolean - True if authenticated, false otherwise
   */
  const isAuthenticated = (): boolean => {
    const tokens = getTokens();
    if (!tokens) return false;

    // If refresh token is expired, user needs to re-login
    if (isRefreshTokenExpired()) return false;

    return true;
  };

  /**
   * Clear all authentication tokens
   */
  const clearTokens = (): void => {
    if (import.meta.client) {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  /**
   * Logout user by clearing tokens and Supabase session
   */
  const logout = async (): Promise<void> => {
    // Sign out from Supabase
    if (import.meta.client) {
      const supabase = useSupabase();
      await supabase.auth.signOut();
    }

    clearTokens();

    // Clear user profile from global state
    if (import.meta.client) {
      userProfileState.value = null;
    }
  };

  return {
    saveTokens,
    getTokens,
    getAccessToken,
    getRefreshToken,
    isAccessTokenExpired,
    isRefreshTokenExpired,
    isAuthenticated,
    clearTokens,
    logout,
  };
};
