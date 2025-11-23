/**
 * API Client Composable
 * Provides a configured HTTP client for backend API calls with authentication
 */

interface ApiConfig {
  baseURL: string;
  token: string;
}

interface RefreshTokenResponse {
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  token_type: string;
}

export const useApi = () => {
  const config = useRuntimeConfig();
  const auth = useAuth();

  // Get API configuration from runtime config
  const apiConfig: ApiConfig = {
    baseURL: (config.public.apiBaseUrl as string) || "https://api.example.com",
    token: (config.public.apiToken as string) || "",
  };

  /**
   * Refresh the access token using the refresh token
   * @returns Promise<boolean> - True if refresh successful, false otherwise
   */
  const refreshAccessToken = async (): Promise<boolean> => {
    try {
      const refreshToken = auth.getRefreshToken();

      if (!refreshToken) {
        console.error("No refresh token available");
        return false;
      }

      // Check if refresh token itself is expired
      if (auth.isRefreshTokenExpired()) {
        console.error("Refresh token is expired");
        auth.clearTokens();
        return false;
      }

      // Remove trailing slash from baseURL
      const baseURL = apiConfig.baseURL.replace(/\/$/, "");
      const url = `${baseURL}/api/v1/auth/token`;

      // Use GET request to /api/v1/auth/token endpoint with refresh token in Authorization header
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        console.error("Token refresh failed:", response.statusText);
        auth.clearTokens();
        return false;
      }

      const data = (await response.json()) as RefreshTokenResponse;

      if (data.access_token) {
        // Save the new tokens
        auth.saveTokens(data);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error refreshing token:", error);
      auth.clearTokens();
      return false;
    }
  };

  /**
   * Make an authenticated API request
   * @param endpoint - API endpoint (e.g., '/users/profile')
   * @param options - Fetch options (method, body, headers, etc.)
   * @param isRetry - Internal flag to prevent infinite retry loops
   */
  const request = async <T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> => {
    // Remove trailing slash from baseURL and leading slash from endpoint to prevent double slashes
    const baseURL = apiConfig.baseURL.replace(/\/$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseURL}${cleanEndpoint}`;

    // Check if body is FormData to avoid setting Content-Type
    const isFormData = options.body instanceof FormData;

    // Get access token from auth storage
    const accessToken = auth.getAccessToken();
    const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${apiConfig.token}`;

    // Merge headers with authentication
    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers: HeadersInit = isFormData
      ? {
          Authorization: authHeader,
          ...options.headers,
        }
      : {
          "Content-Type": "application/json",
          Authorization: authHeader,
          ...options.headers,
        };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - Token expired
      if (response.status === 401 && !isRetry) {
        console.log("Token expired (401), attempting to refresh...");

        // Try to refresh the token
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
          // Retry the original request with the new token
          console.log("Token refreshed successfully, retrying request...");
          return request<T>(endpoint, options, true);
        } else {
          // Refresh failed, redirect to login or throw error
          console.error("Token refresh failed, user needs to re-authenticate");
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Authentication failed. Please login again.");
        }
      }

      // Handle other non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
      }

      // Parse JSON response
      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  };

  /**
   * GET request
   */
  const get = <T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> => {
    // Check if data is FormData
    const isFormData = data instanceof FormData;

    // For FormData, send it in the body
    const body = isFormData ? data : undefined;

    // If data is a plain object (not FormData), convert to query parameters
    let url = endpoint;
    if (data && !isFormData && typeof data === "object") {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    return request<T>(url, {
      ...options,
      method: "GET",
      body,
    });
  };

  /**
   * POST request
   */
  const post = <T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> => {
    // Check if data is FormData
    const isFormData = data instanceof FormData;

    // Don't stringify FormData
    const body = isFormData ? data : data ? JSON.stringify(data) : undefined;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers: HeadersInit = isFormData
      ? { ...options.headers }
      : { "Content-Type": "application/json", ...options.headers };

    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body,
      headers,
    });
  };

  /**
   * POST request with form data (multipart/form-data)
   */
  const postForm = <T = unknown>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> => {
    return post<T>(endpoint, formData, options);
  };

  /**
   * PUT request
   */
  const put = <T = unknown>(
    endpoint: string,
    data?: unknown,
    queryParams?: Record<string, string | number>,
    options: RequestInit = {}
  ): Promise<T> => {
    // Check if data is FormData
    const isFormData = data instanceof FormData;

    // Build URL with query parameters
    let url = endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    // Don't stringify FormData
    const body = isFormData ? data : data ? JSON.stringify(data) : undefined;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers: HeadersInit = isFormData
      ? { ...options.headers }
      : { "Content-Type": "application/json", ...options.headers };

    return request<T>(url, {
      ...options,
      method: "PUT",
      body,
      headers,
    });
  };

  /**
   * PATCH request
   */
  const patch = <T = unknown>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<T> => {
    return request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  };

  /**
   * DELETE request
   */
  const del = <T = unknown>(
    endpoint: string,
    queryParams?: Record<string, string | number>,
    options: RequestInit = {}
  ): Promise<T> => {
    // Build URL with query parameters
    let url = endpoint;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${queryString}`;
      }
    }

    return request<T>(url, {
      ...options,
      method: "DELETE",
    });
  };

  /**
   * Upload file with multipart/form-data
   */
  const upload = async <T = unknown>(
    endpoint: string,
    formData: FormData,
    options: RequestInit = {}
  ): Promise<T> => {
    // Remove trailing slash from baseURL and leading slash from endpoint to prevent double slashes
    const baseURL = apiConfig.baseURL.replace(/\/$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${baseURL}${cleanEndpoint}`;

    // Get access token from auth storage
    const accessToken = auth.getAccessToken();
    const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${apiConfig.token}`;

    // Don't set Content-Type for FormData - browser will set it with boundary
    const headers: HeadersInit = {
      Authorization: authHeader,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Upload Error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  return {
    request,
    get,
    post,
    postForm,
    put,
    patch,
    delete: del,
    upload,
    // Expose config for debugging
    config: apiConfig,
  };
};
