// AI Agent Planning System
// Creates and executes multi-step plans for complex tasks

import { OpenAI } from 'openai';
import { agentMemory } from '../memory/agent-memory';
import { rulesEngine, RuleEvaluationContext } from '../rules/rules-engine';
import { ragSystem } from '../rag/rag-system';
import DynamoDBService, { TABLES } from '../db/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Plan {
  id: string;
  agentId: string;
  userId: string;
  task: string;
  steps: PlanStep[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  currentStepIndex: number;
  result?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PlanStep {
  id: string;
  order: number;
  description: string;
  tool?: string;
  action?: string;
  params?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  result?: any;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  dependencies?: string[]; // IDs of steps that must complete first
}

export interface PlanningContext {
  agentId: string;
  userId: string;
  task: string;
  availableTools: string[];
  knowledgeBases?: string[];
  constraints?: string[];
  maxSteps?: number;
}

export class AgentPlanner {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Create a plan for a given task
   */
  async createPlan(context: PlanningContext): Promise<Plan> {
    // Retrieve relevant memories
    const memories = await agentMemory.retrieve({
      agentId: context.agentId,
      limit: 10,
      minImportance: 0.5,
    });

    // Query knowledge bases if available
    let knowledgeContext = '';
    if (context.knowledgeBases && context.knowledgeBases.length > 0) {
      for (const kbId of context.knowledgeBases) {
        const results = await ragSystem.query({
          query: context.task,
          knowledgeBaseId: kbId,
          agentId: context.agentId,
          topK: 3,
        });
        knowledgeContext += results.map(r => r.content).join('\n');
      }
    }

    // Generate plan using LLM
    const systemPrompt = `You are an AI planning assistant. Create a detailed, step-by-step plan to accomplish the given task.

Available tools: ${context.availableTools.join(', ')}
${context.constraints ? `Constraints: ${context.constraints.join(', ')}` : ''}
${memories.length > 0 ? `Relevant memories:\n${memories.map(m => m.content).join('\n')}` : ''}
${knowledgeContext ? `Relevant knowledge:\n${knowledgeContext}` : ''}

Return a JSON array of steps, each with:
- description: Clear description of the step
- tool: Tool to use (if applicable)
- action: Specific action to perform
- params: Parameters for the action
- dependencies: Array of step indices that must complete first (0-indexed)

Example:
[
  {
    "description": "Fetch unread emails",
    "tool": "gmail",
    "action": "list",
    "params": { "query": "is:unread" },
    "dependencies": []
  },
  {
    "description": "Analyze email content",
    "tool": "llm",
    "action": "analyze",
    "params": { "input": "{{step_0_result}}" },
    "dependencies": [0]
  }
]`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Task: ${context.task}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const planData = JSON.parse(response.choices[0].message.content || '{"steps": []}');
    const steps: PlanStep[] = (planData.steps || []).map((step: any, index: number) => ({
      id: `step_${uuidv4()}`,
      order: index,
      description: step.description,
      tool: step.tool,
      action: step.action,
      params: step.params,
      status: 'pending',
      dependencies: step.dependencies || [],
    }));

    const plan: Plan = {
      id: `plan_${uuidv4()}`,
      agentId: context.agentId,
      userId: context.userId,
      task: context.task,
      steps,
      status: 'pending',
      currentStepIndex: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store plan in DynamoDB
    await DynamoDBService.put(TABLES.EXECUTIONS, {
      ...plan,
      PK: `AGENT#${context.agentId}`,
      SK: `PLAN#${plan.id}`,
      GSI1PK: `USER#${context.userId}`,
      GSI1SK: `PLAN#${plan.id}`,
    });

    return plan;
  }

  /**
   * Execute a plan step by step
   */
  async executePlan(planId: string, agentId: string): Promise<Plan> {
    const plan = await this.getPlan(planId, agentId);
    if (!plan) {
      throw new Error('Plan not found');
    }

    if (plan.status !== 'pending' && plan.status !== 'in_progress') {
      throw new Error(`Cannot execute plan with status: ${plan.status}`);
    }

    // Update plan status
    plan.status = 'in_progress';
    await this.updatePlan(plan);

    try {
      // Execute steps in order, respecting dependencies
      for (let i = plan.currentStepIndex; i < plan.steps.length; i++) {
        const step = plan.steps[i];

        // Check if dependencies are met
        if (step.dependencies && step.dependencies.length > 0) {
          const dependenciesMet = step.dependencies.every(depIndex => {
            const depStep = plan.steps[depIndex];
            return depStep && depStep.status === 'completed';
          });

          if (!dependenciesMet) {
            step.status = 'skipped';
            continue;
          }
        }

        // Evaluate rules before executing step
        const ruleContext: RuleEvaluationContext = {
          agentId,
          executionId: planId,
          input: step.params,
          currentState: {
            planId,
            stepIndex: i,
            previousResults: plan.steps.slice(0, i).map(s => s.result),
          },
        };

        const ruleEval = await rulesEngine.evaluateRules(ruleContext);
        if (ruleEval.shouldStop) {
          plan.status = 'cancelled';
          plan.error = 'Execution stopped by rule';
          await this.updatePlan(plan);
          return plan;
        }

        // Execute step
        step.status = 'in_progress';
        step.startedAt = new Date().toISOString();
        await this.updatePlan(plan);

        try {
          const result = await this.executeStep(step, plan, agentId);
          step.result = result;
          step.status = 'completed';
          step.completedAt = new Date().toISOString();

          // Store step result in memory
          await agentMemory.store(
            agentId,
            plan.userId,
            `Completed: ${step.description}. Result: ${JSON.stringify(result)}`,
            'episodic',
            0.6,
            { planId, stepId: step.id }
          );
        } catch (error: any) {
          step.status = 'failed';
          step.error = error.message;
          plan.status = 'failed';
          plan.error = `Step ${i} failed: ${error.message}`;
          await this.updatePlan(plan);
          return plan;
        }

        plan.currentStepIndex = i + 1;
        await this.updatePlan(plan);
      }

      // All steps completed
      plan.status = 'completed';
      plan.completedAt = new Date().toISOString();
      plan.result = plan.steps[plan.steps.length - 1]?.result;

      // Store completion in memory
      await agentMemory.store(
        agentId,
        plan.userId,
        `Completed task: ${plan.task}`,
        'long_term',
        0.8,
        { planId: plan.id, result: plan.result }
      );

      await this.updatePlan(plan);
      return plan;
    } catch (error: any) {
      plan.status = 'failed';
      plan.error = error.message;
      await this.updatePlan(plan);
      throw error;
    }
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId: string, agentId: string): Promise<Plan | null> {
    const item = await DynamoDBService.get(TABLES.EXECUTIONS, {
      PK: `AGENT#${agentId}`,
      SK: `PLAN#${planId}`,
    });

    if (!item) return null;

    return {
      id: item.id,
      agentId: item.agentId,
      userId: item.userId,
      task: item.task,
      steps: item.steps,
      status: item.status,
      currentStepIndex: item.currentStepIndex,
      result: item.result,
      error: item.error,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      completedAt: item.completedAt,
    };
  }

  /**
   * Cancel a running plan
   */
  async cancelPlan(planId: string, agentId: string): Promise<void> {
    await DynamoDBService.update(
      TABLES.EXECUTIONS,
      { PK: `AGENT#${agentId}`, SK: `PLAN#${planId}` },
      'SET #status = :status, updatedAt = :updatedAt',
      {
        ':status': 'cancelled',
        ':updatedAt': new Date().toISOString(),
      },
      { '#status': 'status' }
    );
  }

  // Private helper methods

  private async updatePlan(plan: Plan): Promise<void> {
    plan.updatedAt = new Date().toISOString();
    await DynamoDBService.put(TABLES.EXECUTIONS, {
      ...plan,
      PK: `AGENT#${plan.agentId}`,
      SK: `PLAN#${plan.id}`,
      GSI1PK: `USER#${plan.userId}`,
      GSI1SK: `PLAN#${plan.id}`,
    });
  }

  private async executeStep(step: PlanStep, plan: Plan, agentId: string): Promise<any> {
    // Replace template variables in params
    const params = this.replaceTemplateVariables(step.params || {}, plan);

    // Execute based on tool
    switch (step.tool) {
      case 'llm':
        return await this.executeLLMAction(step.action!, params);
      
      case 'gmail':
        return await this.executeGmailAction(step.action!, params, agentId);
      
      case 'memory':
        return await this.executeMemoryAction(step.action!, params, agentId, plan.userId);
      
      case 'rag':
        return await this.executeRAGAction(step.action!, params, agentId);
      
      default:
        // For other tools, return a placeholder
        return { success: true, message: `Executed ${step.tool}.${step.action}` };
    }
  }

  private replaceTemplateVariables(params: Record<string, any>, plan: Plan): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.includes('{{')) {
        // Replace {{step_N_result}} with actual result
        const match = value.match(/\{\{step_(\d+)_result\}\}/);
        if (match) {
          const stepIndex = parseInt(match[1]);
          result[key] = plan.steps[stepIndex]?.result;
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private async executeLLMAction(action: string, params: Record<string, any>): Promise<any> {
    const response = await this.openai.chat.completions.create({
      model: params.model || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: params.systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: params.input || params.prompt },
      ],
      temperature: params.temperature || 0.7,
    });

    return response.choices[0].message.content;
  }

  private async executeGmailAction(action: string, params: Record<string, any>, agentId: string): Promise<any> {
    // Placeholder - would integrate with actual Gmail API
    return { success: true, action, params };
  }

  private async executeMemoryAction(action: string, params: Record<string, any>, agentId: string, userId: string): Promise<any> {
    if (action === 'store') {
      return await agentMemory.store(
        agentId,
        userId,
        params.content,
        params.type || 'short_term',
        params.importance || 0.5
      );
    } else if (action === 'retrieve') {
      return await agentMemory.retrieve({
        agentId,
        ...params,
      });
    }
    return null;
  }

  private async executeRAGAction(action: string, params: Record<string, any>, agentId: string): Promise<any> {
    if (action === 'query') {
      return await ragSystem.query({
        query: params.query,
        knowledgeBaseId: params.knowledgeBaseId,
        agentId,
        topK: params.topK || 5,
      });
    }
    return null;
  }
}

// Export singleton
export const agentPlanner = new AgentPlanner();
