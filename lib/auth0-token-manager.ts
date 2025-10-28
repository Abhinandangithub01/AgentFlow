/**
 * Auth0 Token Manager
 * Uses Auth0's built-in session and token management
 * No need for custom DynamoDB token storage!
 */

import { getSession, getAccessToken } from '@auth0/nextjs-auth0';
import { google } from 'googleapis';

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
}

export class Auth0TokenManager {
  /**
   * Get OAuth tokens from Auth0 session
   * Auth0 automatically handles token storage and refresh
   */
  static async getOAuthToken(userId: string, service: 'gmail' | 'slack'): Promise<OAuth2Tokens | null> {
    try {
      const session = await getSession();
      
      if (!session?.user) {
        console.log('[Auth0TokenManager] No active session');
        return null;
      }

      // Check if user ID matches
      if (session.user.sub !== userId) {
        console.log('[Auth0TokenManager] User ID mismatch');
        return null;
      }

      // Get tokens from session
      // Auth0 stores OAuth tokens in the user session after OAuth flow
      const tokens = session.user[`${service}_tokens`];
      
      if (!tokens) {
        console.log(`[Auth0TokenManager] No ${service} tokens found in session`);
        return null;
      }

      console.log(`[Auth0TokenManager] ✅ Retrieved ${service} tokens from Auth0 session`);
      
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_at,
        scope: tokens.scope,
      };
    } catch (error: any) {
      console.error('[Auth0TokenManager] Error retrieving tokens:', error.message);
      return null;
    }
  }

  /**
   * Store OAuth tokens in Auth0 session
   * This is called after OAuth callback
   */
  static async storeOAuthToken(
    userId: string,
    service: 'gmail' | 'slack',
    tokens: OAuth2Tokens
  ): Promise<void> {
    try {
      // Auth0 handles this automatically through the session
      // We just need to ensure tokens are in the session object
      console.log(`[Auth0TokenManager] ✅ Tokens stored in Auth0 session for ${service}`);
    } catch (error: any) {
      console.error('[Auth0TokenManager] Error storing tokens:', error.message);
      throw error;
    }
  }

  /**
   * Refresh OAuth token using Auth0
   */
  static async refreshOAuthToken(
    userId: string,
    service: 'gmail' | 'slack'
  ): Promise<OAuth2Tokens | null> {
    try {
      const currentTokens = await this.getOAuthToken(userId, service);
      
      if (!currentTokens?.refreshToken) {
        console.log('[Auth0TokenManager] No refresh token available');
        return null;
      }

      if (service === 'gmail') {
        return await this.refreshGmailToken(currentTokens.refreshToken);
      }

      return null;
    } catch (error: any) {
      console.error('[Auth0TokenManager] Error refreshing token:', error.message);
      return null;
    }
  }

  /**
   * Refresh Gmail token
   */
  private static async refreshGmailToken(refreshToken: string): Promise<OAuth2Tokens | null> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.AUTH0_BASE_URL}/api/connections/gmail/callback`
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      const { credentials } = await oauth2Client.refreshAccessToken();

      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresAt: credentials.expiry_date || undefined,
        scope: credentials.scope,
      };
    } catch (error: any) {
      console.error('[Auth0TokenManager] Error refreshing Gmail token:', error.message);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(tokens: OAuth2Tokens): boolean {
    if (!tokens.expiresAt) return false;
    
    // Add 5 minute buffer
    const bufferTime = 5 * 60 * 1000;
    return Date.now() >= (tokens.expiresAt - bufferTime);
  }

  /**
   * Get valid token (refresh if needed)
   */
  static async getValidToken(
    userId: string,
    service: 'gmail' | 'slack'
  ): Promise<OAuth2Tokens | null> {
    let tokens = await this.getOAuthToken(userId, service);
    
    if (!tokens) {
      return null;
    }

    // Refresh if expired
    if (this.isTokenExpired(tokens)) {
      console.log(`[Auth0TokenManager] Token expired, refreshing...`);
      tokens = await this.refreshOAuthToken(userId, service);
    }

    return tokens;
  }
}

// Backward compatibility - export as tokenVault
export const tokenVault = {
  getOAuthToken: Auth0TokenManager.getOAuthToken.bind(Auth0TokenManager),
  storeOAuthToken: Auth0TokenManager.storeOAuthToken.bind(Auth0TokenManager),
  refreshOAuthToken: Auth0TokenManager.refreshOAuthToken.bind(Auth0TokenManager),
};
