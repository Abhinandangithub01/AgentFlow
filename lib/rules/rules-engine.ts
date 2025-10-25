// Rules Engine for Agent Behavior
// Allows users to define custom rules and guardrails for agents

import DynamoDBService, { TABLES } from '../db/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export interface Rule {
  id: string;
  agentId: string;
  userId: string;
  name: string;
  description: string;
  type: 'trigger' | 'condition' | 'action' | 'guardrail';
  priority: number; // Higher = more important
  enabled: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex' | 'exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'execute_tool' | 'send_notification' | 'store_memory' | 'update_context' | 'stop_execution';
  params: Record<string, any>;
}

export interface RuleEvaluationContext {
  agentId: string;
  executionId?: string;
  input: any;
  currentState: Record<string, any>;
  memory?: any[];
  tools?: string[];
}

export class RulesEngine {
  /**
   * Create a new rule
   */
  async createRule(
    agentId: string,
    userId: string,
    name: string,
    description: string,
    type: Rule['type'],
    conditions: RuleCondition[],
    actions: RuleAction[],
    priority: number = 50
  ): Promise<Rule> {
    const rule: Rule = {
      id: `rule_${uuidv4()}`,
      agentId,
      userId,
      name,
      description,
      type,
      priority,
      enabled: true,
      conditions,
      actions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.put(TABLES.RULES, {
      ...rule,
      PK: `AGENT#${agentId}`,
      SK: `RULE#${rule.id}`,
      GSI1PK: `USER#${userId}`,
      GSI1SK: `AGENT#${agentId}#RULE#${rule.id}`,
    });

    return rule;
  }

  /**
   * Evaluate all rules for an agent in given context
   */
  async evaluateRules(context: RuleEvaluationContext): Promise<{
    matchedRules: Rule[];
    actions: RuleAction[];
    shouldStop: boolean;
  }> {
    // Get all enabled rules for the agent
    const rules = await this.getRules(context.agentId);
    const enabledRules = rules.filter(r => r.enabled);

    // Sort by priority (highest first)
    enabledRules.sort((a, b) => b.priority - a.priority);

    const matchedRules: Rule[] = [];
    const actions: RuleAction[] = [];
    let shouldStop = false;

    // Evaluate each rule
    for (const rule of enabledRules) {
      if (this.evaluateConditions(rule.conditions, context)) {
        matchedRules.push(rule);
        actions.push(...rule.actions);

        // Check if any action is stop_execution
        if (rule.actions.some(a => a.type === 'stop_execution')) {
          shouldStop = true;
          break; // Stop evaluating further rules
        }
      }
    }

    return { matchedRules, actions, shouldStop };
  }

  /**
   * Update a rule
   */
  async updateRule(
    ruleId: string,
    agentId: string,
    updates: Partial<Omit<Rule, 'id' | 'agentId' | 'userId' | 'createdAt'>>
  ): Promise<Rule> {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.entries(updates).forEach(([key, value], index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpressions.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = value;
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const result = await DynamoDBService.update(
      TABLES.RULES,
      { PK: `AGENT#${agentId}`, SK: `RULE#${ruleId}` },
      `SET ${updateExpressions.join(', ')}`,
      expressionAttributeValues,
      expressionAttributeNames
    );

    return result as Rule;
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string, agentId: string): Promise<void> {
    await DynamoDBService.delete(TABLES.RULES, {
      PK: `AGENT#${agentId}`,
      SK: `RULE#${ruleId}`,
    });
  }

  /**
   * Get all rules for an agent
   */
  async getRules(agentId: string): Promise<Rule[]> {
    const items = await DynamoDBService.query(
      TABLES.RULES,
      'PK = :pk',
      { ':pk': `AGENT#${agentId}` }
    );

    return items.map(item => ({
      id: item.id,
      agentId: item.agentId,
      userId: item.userId,
      name: item.name,
      description: item.description,
      type: item.type,
      priority: item.priority,
      enabled: item.enabled,
      conditions: item.conditions,
      actions: item.actions,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));
  }

  /**
   * Toggle rule enabled/disabled
   */
  async toggleRule(ruleId: string, agentId: string, enabled: boolean): Promise<void> {
    await DynamoDBService.update(
      TABLES.RULES,
      { PK: `AGENT#${agentId}`, SK: `RULE#${ruleId}` },
      'SET enabled = :enabled, updatedAt = :updatedAt',
      {
        ':enabled': enabled,
        ':updatedAt': new Date().toISOString(),
      }
    );
  }

  // Private helper methods

  private evaluateConditions(conditions: RuleCondition[], context: RuleEvaluationContext): boolean {
    if (conditions.length === 0) return true;

    let result = this.evaluateCondition(conditions[0], context);

    for (let i = 1; i < conditions.length; i++) {
      const condition = conditions[i];
      const conditionResult = this.evaluateCondition(condition, context);

      if (condition.logicalOperator === 'OR') {
        result = result || conditionResult;
      } else {
        // Default to AND
        result = result && conditionResult;
      }
    }

    return result;
  }

  private evaluateCondition(condition: RuleCondition, context: RuleEvaluationContext): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      
      case 'contains':
        if (typeof fieldValue === 'string') {
          return fieldValue.includes(condition.value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return false;
      
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      
      case 'regex':
        if (typeof fieldValue === 'string') {
          const regex = new RegExp(condition.value);
          return regex.test(fieldValue);
        }
        return false;
      
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      
      default:
        return false;
    }
  }

  private getFieldValue(field: string, context: RuleEvaluationContext): any {
    const parts = field.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }
}

// Export singleton
export const rulesEngine = new RulesEngine();

// Example rules:
/*
// Guardrail: Don't send emails after 10 PM
{
  name: "No late night emails",
  type: "guardrail",
  conditions: [
    { field: "currentState.time.hour", operator: "greater_than", value: 22 }
  ],
  actions: [
    { type: "stop_execution", params: { reason: "Outside business hours" } }
  ]
}

// Trigger: Auto-respond to urgent emails
{
  name: "Auto-respond urgent",
  type: "trigger",
  conditions: [
    { field: "input.subject", operator: "contains", value: "URGENT" },
    { field: "input.from", operator: "contains", value: "@company.com" }
  ],
  actions: [
    { type: "execute_tool", params: { tool: "gmail", action: "send", template: "urgent_response" } },
    { type: "send_notification", params: { channel: "slack", message: "Urgent email received" } }
  ]
}
*/
