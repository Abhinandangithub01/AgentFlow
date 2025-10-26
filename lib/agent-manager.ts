// AI Agent Management Service
// Handles creation, configuration, and lifecycle of AI agents

import { AIAgent, AgentConfig, AgentExecution, AgentType, AgentStatus } from '@/types/agent';
import { tokenVault } from './token-vault';
import DynamoDBService, { TABLES } from './db/dynamodb';

export class AgentManager {
  private static instance: AgentManager;
  
  private constructor() {}
  
  static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  /**
   * Create a new AI agent
   */
  async createAgent(
    userId: string,
    name: string,
    type: AgentType,
    config: Partial<AgentConfig>
  ): Promise<AIAgent> {
    try {
      const agent: AIAgent = {
        id: `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        name,
        description: config.systemPrompt || `AI agent for ${type}`,
        type,
        status: 'configuring',
        capabilities: this.getDefaultCapabilities(type),
        tools: [],
        permissions: this.getDefaultPermissions(type),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metadata: {
          config,
        }
      };

      // Store agent (in production, save to database)
      await this.saveAgent(agent);

      return agent;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw new Error('Failed to create agent');
    }
  }

  /**
   * Configure agent with tools and permissions
   */
  async configureAgent(
    agentId: string,
    userId: string,
    config: Partial<AgentConfig>
  ): Promise<AIAgent> {
    try {
      const agent = await this.getAgent(agentId, userId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Update agent configuration
      agent.metadata = {
        ...agent.metadata,
        config: {
          ...agent.metadata?.config,
          ...config,
        }
      };
      agent.updatedAt = new Date().toISOString();

      await this.saveAgent(agent);

      return agent;
    } catch (error) {
      console.error('Error configuring agent:', error);
      throw new Error('Failed to configure agent');
    }
  }

  /**
   * Add tool to agent
   */
  async addToolToAgent(
    agentId: string,
    userId: string,
    toolName: string,
    requiresAuth: boolean = false
  ): Promise<AIAgent> {
    try {
      const agent = await this.getAgent(agentId, userId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      // Check if tool already exists
      if (agent.tools.some(t => t.name === toolName)) {
        throw new Error('Tool already added to agent');
      }

      // Add tool
      agent.tools.push({
        id: `tool_${Date.now()}`,
        name: toolName,
        type: toolName as any,
        description: `${toolName} integration`,
        enabled: true,
        requiresAuth,
        permissions: this.getToolPermissions(toolName),
      });

      agent.updatedAt = new Date().toISOString();
      await this.saveAgent(agent);

      return agent;
    } catch (error) {
      console.error('Error adding tool to agent:', error);
      throw new Error('Failed to add tool to agent');
    }
  }

  /**
   * Authorize agent to use a service (store credentials in Token Vault)
   */
  async authorizeAgentTool(
    agentId: string,
    userId: string,
    service: string,
    accessToken: string,
    refreshToken?: string
  ): Promise<void> {
    try {
      // Store credentials in Token Vault
      await tokenVault.storeOAuthToken(
        userId,
        service,
        {
          accessToken,
          refreshToken,
          tokenType: 'Bearer',
        },
        agentId
      );

      // Update agent tool status
      const agent = await this.getAgent(agentId, userId);
      if (agent) {
        const tool = agent.tools.find(t => t.name === service);
        if (tool) {
          tool.tokenVaultKey = `${userId}:${service}:${agentId}`;
          await this.saveAgent(agent);
        }
      }
    } catch (error) {
      console.error('Error authorizing agent tool:', error);
      throw new Error('Failed to authorize agent tool');
    }
  }

  /**
   * Start agent execution
   */
  async startAgent(agentId: string, userId: string): Promise<AIAgent> {
    try {
      const agent = await this.getAgent(agentId, userId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      agent.status = 'active';
      agent.lastActiveAt = new Date().toISOString();
      agent.updatedAt = new Date().toISOString();

      await this.saveAgent(agent);

      return agent;
    } catch (error) {
      console.error('Error starting agent:', error);
      throw new Error('Failed to start agent');
    }
  }

  /**
   * Pause agent execution
   */
  async pauseAgent(agentId: string, userId: string): Promise<AIAgent> {
    try {
      const agent = await this.getAgent(agentId, userId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      agent.status = 'paused';
      agent.updatedAt = new Date().toISOString();

      await this.saveAgent(agent);

      return agent;
    } catch (error) {
      console.error('Error pausing agent:', error);
      throw new Error('Failed to pause agent');
    }
  }

  /**
   * Execute agent task
   */
  async executeTask(
    agentId: string,
    userId: string,
    task: string
  ): Promise<AgentExecution> {
    try {
      const agent = await this.getAgent(agentId, userId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      if (agent.status !== 'active') {
        throw new Error('Agent is not active');
      }

      const execution: AgentExecution = {
        id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentId,
        userId,
        task,
        status: 'pending',
        startedAt: new Date().toISOString(),
        steps: [],
      };

      // Start execution (in production, this would be async)
      await this.processExecution(execution, agent);

      return execution;
    } catch (error) {
      console.error('Error executing task:', error);
      throw new Error('Failed to execute task');
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string, userId: string): Promise<AIAgent | null> {
    if (typeof window === 'undefined') {
      try {
        // Try DynamoDB first
        const item = await DynamoDBService.get(TABLES.AGENTS, {
          PK: `USER#${userId}`,
          SK: `AGENT#${agentId}`,
        });
        
        if (item) {
          console.log(`[AgentManager] Retrieved agent from DynamoDB: ${agentId}`);
          return item as AIAgent;
        }
      } catch (error: any) {
        console.error(`[AgentManager] DynamoDB get failed:`, error.message);
      }
      
      // Fallback to memory
      global.agents = global.agents || new Map();
      const agent = global.agents.get(agentId);
      if (agent && agent.userId === userId) {
        console.log(`[AgentManager] Retrieved agent from memory: ${agentId}`);
        return agent;
      }
    }
    return null;
  }

  /**
   * List all agents for a user
   */
  async listAgents(userId: string): Promise<AIAgent[]> {
    if (typeof window === 'undefined') {
      try {
        // Try DynamoDB first
        const items = await DynamoDBService.query(
          TABLES.AGENTS,
          'PK = :pk AND begins_with(SK, :sk)',
          {
            ':pk': `USER#${userId}`,
            ':sk': 'AGENT#'
          }
        );
        
        if (items && items.length > 0) {
          console.log(`[AgentManager] Retrieved ${items.length} agents from DynamoDB`);
          return items as AIAgent[];
        }
      } catch (error: any) {
        console.error(`[AgentManager] DynamoDB query failed:`, error.message);
      }
      
      // Fallback to memory
      if (global.agents) {
        const agents = Array.from(global.agents.values()).filter(a => a.userId === userId);
        console.log(`[AgentManager] Retrieved ${agents.length} agents from memory`);
        return agents;
      }
    }
    return [];
  }

  /**
   * Delete agent
   */
  async deleteAgent(agentId: string, userId: string): Promise<boolean> {
    try {
      const agent = await this.getAgent(agentId, userId);
      if (!agent) {
        return false;
      }

      // Revoke all tokens
      for (const tool of agent.tools) {
        if (tool.tokenVaultKey) {
          await tokenVault.revokeToken(userId, tool.name, agentId);
        }
      }

      // Delete agent from DynamoDB
      if (typeof window === 'undefined') {
        try {
          await DynamoDBService.delete(TABLES.AGENTS, {
            PK: `USER#${userId}`,
            SK: `AGENT#${agentId}`,
          });
          console.log(`[AgentManager] Deleted agent from DynamoDB: ${agentId}`);
        } catch (error: any) {
          console.error(`[AgentManager] DynamoDB delete failed:`, error.message);
        }
        
        // Also delete from memory
        if (global.agents) {
          global.agents.delete(agentId);
        }
      }

      return true;
    } catch (error) {
      console.error('Error deleting agent:', error);
      return false;
    }
  }

  // Private helper methods

  private async saveAgent(agent: AIAgent): Promise<void> {
    if (typeof window === 'undefined') {
      try {
        // Save to DynamoDB for persistence
        await DynamoDBService.put(TABLES.AGENTS, {
          PK: `USER#${agent.userId}`,
          SK: `AGENT#${agent.id}`,
          ...agent,
        });
        console.log(`[AgentManager] Saved agent to DynamoDB: ${agent.id}`);
      } catch (error: any) {
        console.error(`[AgentManager] DynamoDB save failed, using memory:`, error.message);
        // Fallback to memory if DynamoDB fails
        global.agents = global.agents || new Map();
        global.agents.set(agent.id, agent);
        console.log(`[AgentManager] Saved agent to memory: ${agent.id}`);
      }
    }
  }

  private getDefaultCapabilities(type: AgentType) {
    const capabilityMap: Record<AgentType, any[]> = {
      email_assistant: [
        { id: 'read_email', name: 'Read Emails', description: 'Read and analyze emails', enabled: true },
        { id: 'send_email', name: 'Send Emails', description: 'Compose and send emails', enabled: true },
        { id: 'categorize', name: 'Categorize', description: 'Categorize and label emails', enabled: true },
      ],
      calendar_manager: [
        { id: 'read_calendar', name: 'Read Calendar', description: 'View calendar events', enabled: true },
        { id: 'create_event', name: 'Create Events', description: 'Schedule new events', enabled: true },
        { id: 'update_event', name: 'Update Events', description: 'Modify existing events', enabled: true },
      ],
      task_automator: [
        { id: 'workflow', name: 'Workflow Automation', description: 'Automate multi-step tasks', enabled: true },
        { id: 'scheduling', name: 'Task Scheduling', description: 'Schedule automated tasks', enabled: true },
      ],
      data_analyst: [
        { id: 'analyze', name: 'Data Analysis', description: 'Analyze data and generate insights', enabled: true },
        { id: 'visualize', name: 'Visualization', description: 'Create charts and visualizations', enabled: true },
      ],
      content_creator: [
        { id: 'generate', name: 'Content Generation', description: 'Generate written content', enabled: true },
        { id: 'edit', name: 'Content Editing', description: 'Edit and improve content', enabled: true },
      ],
      custom: [],
    };

    return capabilityMap[type] || [];
  }

  private getDefaultPermissions(type: AgentType) {
    // Return default permissions based on agent type
    return [
      { resource: 'user_data', actions: ['read'] },
    ];
  }

  private getToolPermissions(toolName: string): string[] {
    const permissionMap: Record<string, string[]> = {
      gmail: ['gmail.readonly', 'gmail.send', 'gmail.modify'],
      calendar: ['calendar.readonly', 'calendar.events'],
      slack: ['chat:write', 'channels:read'],
      notion: ['read', 'write'],
    };

    return permissionMap[toolName] || [];
  }

  private async processExecution(execution: AgentExecution, agent: AIAgent): Promise<void> {
    // Placeholder for actual execution logic
    // In production, this would use LLM and execute tools
    execution.status = 'running';
    
    // Simulate execution
    setTimeout(() => {
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
      execution.result = { message: 'Task completed successfully' };
    }, 1000);
  }
}

// Export singleton instance
export const agentManager = AgentManager.getInstance();

// Global type declaration
declare global {
  var agents: Map<string, AIAgent> | undefined;
}
