/**
 * User-related TypeScript interfaces
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: string;
}
