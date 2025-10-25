// Auth0 AI Agent Types
export interface AIAgent {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: AgentCapability[];
  tools: AgentTool[];
  permissions: AgentPermission[];
  tokenVaultId?: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  metadata?: Record<string, any>;
}

export type AgentType = 
  | 'email_assistant'
  | 'calendar_manager'
  | 'task_automator'
  | 'data_analyst'
  | 'content_creator'
  | 'custom';

export type AgentStatus = 
  | 'active'
  | 'paused'
  | 'stopped'
  | 'error'
  | 'configuring';

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export interface AgentTool {
  id: string;
  name: string;
  type: ToolType;
  description: string;
  enabled: boolean;
  requiresAuth: boolean;
  tokenVaultKey?: string;
  permissions: string[];
  config?: Record<string, any>;
}

export type ToolType =
  | 'gmail'
  | 'calendar'
  | 'slack'
  | 'notion'
  | 'database'
  | 'api'
  | 'custom';

export interface AgentPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  userId: string;
  task: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
  steps: ExecutionStep[];
  tokensUsed?: number;
  cost?: number;
}

export type ExecutionStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ExecutionStep {
  id: string;
  name: string;
  tool?: string;
  status: ExecutionStatus;
  startedAt: string;
  completedAt?: string;
  input?: any;
  output?: any;
  error?: string;
}

// Token Vault Types
export interface TokenVaultEntry {
  id: string;
  userId: string;
  agentId?: string;
  service: string;
  tokenType: 'oauth' | 'api_key' | 'bearer' | 'custom';
  scopes?: string[];
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface SecureToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType: string;
  scope?: string;
}

// RAG (Retrieval Augmented Generation) Types
export interface RAGKnowledgeBase {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'documents' | 'database' | 'api' | 'custom';
  status: 'active' | 'indexing' | 'error';
  permissions: RAGPermission[];
  config: RAGConfig;
  createdAt: string;
  updatedAt: string;
}

export interface RAGPermission {
  agentId: string;
  actions: ('read' | 'search' | 'update')[];
  filters?: Record<string, any>;
}

export interface RAGConfig {
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  vectorStore?: string;
  metadata?: Record<string, any>;
}

export interface RAGQuery {
  query: string;
  knowledgeBaseId: string;
  agentId: string;
  topK?: number;
  filters?: Record<string, any>;
  includeMetadata?: boolean;
}

export interface RAGResult {
  id: string;
  content: string;
  score: number;
  metadata?: Record<string, any>;
  source?: string;
}

// Agent Configuration
export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  knowledgeBases: string[];
  guardrails: AgentGuardrail[];
  rateLimits: RateLimit;
}

export interface AgentGuardrail {
  type: 'content_filter' | 'permission_check' | 'rate_limit' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
}

export interface RateLimit {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  tokensPerDay?: number;
}
