/**
 * Token Refresh Composable
 * Handles refreshing expired access tokens
 */

interface RefreshTokenResponse {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  token_type: string;
}

export const useAuthRefresh = () => {
  const api = useApi();
  const auth = useAuth();

  /**
   * Refresh the access token using the refresh token
   * @returns Promise<RefreshTokenResponse | null> - New tokens or null on failure
   */
  const refreshAccessToken = async (): Promise<RefreshTokenResponse | null> => {
    try {
      const refreshToken = auth.getRefreshToken();

      if (!refreshToken) {
        console.error("No refresh token available");
        return null;
      }

      // Check if refresh token itself is expired
      if (auth.isRefreshTokenExpired()) {
        console.error("Refresh token is expired");
        auth.clearTokens();
        return null;
      }

      // Use GET request to /api/v1/auth/token endpoint with refresh token in Authorization header
      const response = await api.get<RefreshTokenResponse>("/api/v1/auth/token", undefined, {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (response.access_token) {
        // Save the new tokens
        auth.saveTokens(response);
        return response;
      }

      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      auth.clearTokens();
      return null;
    }
  };

  /**
   * Ensure we have a valid access token, refreshing if needed
   * @returns Promise<string | null> - Valid access token or null
   */
  const ensureValidToken = async (): Promise<string | null> => {
    // Check if access token is expired
    if (auth.isAccessTokenExpired()) {
      const newTokens = await refreshAccessToken();
      return newTokens?.access_token || null;
    }

    return auth.getAccessToken();
  };

  return {
    refreshAccessToken,
    ensureValidToken,
  };
};
