/**
 * Improved Token Manager
 * Simplified token management with DynamoDB
 * Better structure, automatic refresh, and proper error handling
 */

import { google } from 'googleapis';
import DynamoDBService, { TABLES } from './db/dynamodb';

export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
}

export class ImprovedTokenManager {
  /**
   * Get OAuth tokens with automatic refresh
   */
  static async getOAuthToken(
    userId: string,
    service: 'gmail' | 'slack'
  ): Promise<OAuth2Tokens | null> {
    try {
      console.log(`[TokenManager] Getting ${service} token for user: ${userId}`);
      
      // Get token from DynamoDB
      const tokenData = await DynamoDBService.get(TABLES.TOKENS, {
        PK: `USER#${userId}`,
        SK: `TOKEN#${service}`,
      });

      if (!tokenData) {
        console.log(`[TokenManager] No ${service} token found`);
        return null;
      }

      const tokens: OAuth2Tokens = {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope,
        tokenType: tokenData.tokenType || 'Bearer',
      };

      // Check if token is expired
      if (this.isTokenExpired(tokens)) {
        console.log(`[TokenManager] Token expired, refreshing...`);
        return await this.refreshOAuthToken(userId, service, tokens);
      }

      console.log(`[TokenManager] ✅ Valid ${service} token retrieved`);
      return tokens;
    } catch (error: any) {
      console.error(`[TokenManager] Error getting ${service} token:`, error.message);
      return null;
    }
  }

  /**
   * Store OAuth tokens
   */
  static async storeOAuthToken(
    userId: string,
    service: 'gmail' | 'slack',
    tokens: OAuth2Tokens
  ): Promise<void> {
    try {
      await DynamoDBService.put(TABLES.TOKENS, {
        PK: `USER#${userId}`,
        SK: `TOKEN#${service}`,
        service,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || '',
        expiresAt: tokens.expiresAt,
        scope: tokens.scope || '',
        tokenType: tokens.tokenType || 'Bearer',
        updatedAt: new Date().toISOString(),
      });

      console.log(`[TokenManager] ✅ ${service} tokens stored`);
    } catch (error: any) {
      console.error(`[TokenManager] Error storing ${service} tokens:`, error.message);
      throw error;
    }
  }

  /**
   * Refresh OAuth token
   */
  static async refreshOAuthToken(
    userId: string,
    service: 'gmail' | 'slack',
    currentTokens: OAuth2Tokens
  ): Promise<OAuth2Tokens | null> {
    try {
      if (!currentTokens.refreshToken) {
        console.log(`[TokenManager] No refresh token available for ${service}`);
        return null;
      }

      if (service === 'gmail') {
        const newTokens = await this.refreshGmailToken(currentTokens.refreshToken);
        if (newTokens) {
          // Store refreshed tokens
          await this.storeOAuthToken(userId, service, newTokens);
          console.log(`[TokenManager] ✅ ${service} token refreshed and stored`);
          return newTokens;
        }
      }

      return null;
    } catch (error: any) {
      console.error(`[TokenManager] Error refreshing ${service} token:`, error.message);
      return null;
    }
  }

  /**
   * Refresh Gmail token using Google OAuth2
   */
  private static async refreshGmailToken(refreshToken: string): Promise<OAuth2Tokens | null> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
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
        tokenType: 'Bearer',
      };
    } catch (error: any) {
      console.error('[TokenManager] Error refreshing Gmail token:', error.message);
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
   * Delete OAuth tokens
   */
  static async deleteOAuthToken(
    userId: string,
    service: 'gmail' | 'slack'
  ): Promise<void> {
    try {
      await DynamoDBService.delete(TABLES.TOKENS, {
        PK: `USER#${userId}`,
        SK: `TOKEN#${service}`,
      });

      console.log(`[TokenManager] ✅ ${service} tokens deleted`);
    } catch (error: any) {
      console.error(`[TokenManager] Error deleting ${service} tokens:`, error.message);
      throw error;
    }
  }
}

// Export as tokenVault for backward compatibility
export const tokenVault = {
  getOAuthToken: ImprovedTokenManager.getOAuthToken.bind(ImprovedTokenManager),
  storeOAuthToken: ImprovedTokenManager.storeOAuthToken.bind(ImprovedTokenManager),
  refreshOAuthToken: ImprovedTokenManager.refreshOAuthToken.bind(ImprovedTokenManager),
  revokeToken: ImprovedTokenManager.deleteOAuthToken.bind(ImprovedTokenManager),
  deleteOAuthToken: ImprovedTokenManager.deleteOAuthToken.bind(ImprovedTokenManager),
};
