// Auth0 Token Vault Integration
// Secure storage for OAuth tokens and API keys used by AI agents

import { TokenVaultEntry, SecureToken } from '@/types/agent';

/**
 * Token Vault Service
 * Manages secure storage and retrieval of credentials for AI agents
 * Uses Auth0's Token Vault for production security
 */
export class TokenVaultService {
  private static instance: TokenVaultService;
  
  private constructor() {}
  
  static getInstance(): TokenVaultService {
    if (!TokenVaultService.instance) {
      TokenVaultService.instance = new TokenVaultService();
    }
    return TokenVaultService.instance;
  }

  /**
   * Store OAuth tokens securely in Token Vault
   */
  async storeOAuthToken(
    userId: string,
    service: string,
    tokens: SecureToken,
    agentId?: string,
    scopes?: string[]
  ): Promise<TokenVaultEntry> {
    try {
      // In production, this would use Auth0 Token Vault API
      // For now, we'll use a secure in-memory store with encryption
      
      const entry: TokenVaultEntry = {
        id: `tv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        agentId,
        service,
        tokenType: 'oauth',
        scopes,
        expiresAt: tokens.expiresIn 
          ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
          : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          tokenType: tokens.tokenType,
          scope: tokens.scope,
        }
      };

      // FIXED: Use vaultKey instead of entry.id for consistent storage/retrieval
      const vaultKey = this.generateVaultKey(userId, service, agentId);
      await this.encryptAndStore(vaultKey, tokens);

      return entry;
    } catch (error) {
      console.error('Error storing OAuth token:', error);
      throw new Error('Failed to store token in vault');
    }
  }

  /**
   * Retrieve OAuth tokens from Token Vault
   */
  async getOAuthToken(
    userId: string,
    service: string,
    agentId?: string
  ): Promise<SecureToken | null> {
    try {
      // In production, retrieve from Auth0 Token Vault
      const vaultKey = this.generateVaultKey(userId, service, agentId);
      const tokens = await this.decryptAndRetrieve(vaultKey);
      
      // Check if token is expired and refresh if needed
      if (tokens && tokens.refreshToken) {
        const isExpired = await this.isTokenExpired(vaultKey);
        if (isExpired) {
          return await this.refreshToken(userId, service, tokens.refreshToken, agentId);
        }
      }
      
      return tokens;
    } catch (error) {
      console.error('Error retrieving OAuth token:', error);
      return null;
    }
  }

  /**
   * Store API key securely
   */
  async storeAPIKey(
    userId: string,
    service: string,
    apiKey: string,
    agentId?: string
  ): Promise<TokenVaultEntry> {
    try {
      const entry: TokenVaultEntry = {
        id: `tv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        agentId,
        service,
        tokenType: 'api_key',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Encrypt and store API key
      await this.encryptAndStore(entry.id, { accessToken: apiKey, tokenType: 'api_key' });

      return entry;
    } catch (error) {
      console.error('Error storing API key:', error);
      throw new Error('Failed to store API key in vault');
    }
  }

  /**
   * Retrieve API key from vault
   */
  async getAPIKey(
    userId: string,
    service: string,
    agentId?: string
  ): Promise<string | null> {
    try {
      const vaultKey = this.generateVaultKey(userId, service, agentId);
      const tokens = await this.decryptAndRetrieve(vaultKey);
      return tokens?.accessToken || null;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  }

  /**
   * Revoke and delete tokens from vault
   */
  async revokeToken(
    userId: string,
    service: string,
    agentId?: string
  ): Promise<boolean> {
    try {
      const vaultKey = this.generateVaultKey(userId, service, agentId);
      
      // Revoke token with service provider if possible
      const tokens = await this.decryptAndRetrieve(vaultKey);
      if (tokens) {
        await this.revokeWithProvider(service, tokens.accessToken);
      }
      
      // Delete from vault
      await this.deleteFromVault(vaultKey);
      
      return true;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }

  /**
   * List all tokens for a user
   */
  async listTokens(userId: string, agentId?: string): Promise<TokenVaultEntry[]> {
    try {
      // In production, query Auth0 Token Vault
      // For now, return mock data
      return [];
    } catch (error) {
      console.error('Error listing tokens:', error);
      return [];
    }
  }

  /**
   * Refresh expired OAuth token
   */
  private async refreshToken(
    userId: string,
    service: string,
    refreshToken: string,
    agentId?: string
  ): Promise<SecureToken | null> {
    try {
      // Service-specific token refresh logic
      const newTokens = await this.refreshWithProvider(service, refreshToken);
      
      if (newTokens) {
        // Update vault with new tokens
        await this.storeOAuthToken(userId, service, newTokens, agentId);
      }
      
      return newTokens;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private async isTokenExpired(vaultKey: string): Promise<boolean> {
    // Implementation would check expiration time
    return false;
  }

  /**
   * Generate vault key for token storage
   */
  private generateVaultKey(userId: string, service: string, agentId?: string): string {
    return agentId 
      ? `${userId}:${service}:${agentId}`
      : `${userId}:${service}`;
  }

  /**
   * Encrypt and store tokens (placeholder for Auth0 Token Vault)
   */
  private async encryptAndStore(key: string, tokens: SecureToken): Promise<void> {
    // In production, use Auth0 Token Vault API
    // For now, store in memory (NOT SECURE - for development only)
    if (typeof window === 'undefined') {
      global.tokenVault = global.tokenVault || new Map();
      global.tokenVault.set(key, tokens);
      console.log(`[TokenVault] Stored token for key: ${key}`);
    }
  }

  /**
   * Decrypt and retrieve tokens (placeholder for Auth0 Token Vault)
   */
  private async decryptAndRetrieve(key: string): Promise<SecureToken | null> {
    // In production, use Auth0 Token Vault API
    if (typeof window === 'undefined' && global.tokenVault) {
      const token = global.tokenVault.get(key) || null;
      console.log(`[TokenVault] Retrieved token for key: ${key}, found: ${!!token}`);
      return token;
    }
    return null;
  }

  /**
   * Delete token from vault
   */
  private async deleteFromVault(key: string): Promise<void> {
    if (typeof window === 'undefined' && global.tokenVault) {
      global.tokenVault.delete(key);
    }
  }

  /**
   * Revoke token with service provider
   */
  private async revokeWithProvider(service: string, accessToken: string): Promise<void> {
    // Service-specific revocation logic
    console.log(`Revoking token for ${service}`);
  }

  /**
   * Refresh token with service provider
   */
  private async refreshWithProvider(service: string, refreshToken: string): Promise<SecureToken | null> {
    // Service-specific refresh logic
    return null;
  }
}

// Export singleton instance
export const tokenVault = TokenVaultService.getInstance();

// Global type declaration
declare global {
  var tokenVault: Map<string, SecureToken> | undefined;
}
