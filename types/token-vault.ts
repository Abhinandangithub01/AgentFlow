// Token Vault Types
// Secure token storage and management for AI agents

export interface SecureToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  scope?: string;
  expiresAt?: string;
}

export interface TokenVaultEntry {
  id: string;
  userId: string;
  agentId?: string;
  service: string;
  tokenType: 'oauth' | 'api_key';
  scopes?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  metadata?: Record<string, any>;
}

export interface TokenRefreshResult {
  success: boolean;
  newToken?: SecureToken;
  error?: string;
}
