'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Zap,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Rule, RuleCondition, RuleAction } from '@/lib/rules/rules-engine';

interface RulesEditorProps {
  agentId: string;
  userId: string;
}

export default function RulesEditor({ agentId, userId }: RulesEditorProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRules();
  }, [agentId]);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRules: Rule[] = [
        {
          id: 'rule_1',
          agentId,
          userId,
          name: 'No Late Night Emails',
          description: 'Prevent sending emails after 10 PM',
          type: 'guardrail',
          priority: 100,
          enabled: true,
          conditions: [
            {
              field: 'currentState.time.hour',
              operator: 'greater_than',
              value: 22,
            },
          ],
          actions: [
            {
              type: 'stop_execution',
              params: { reason: 'Outside business hours' },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'rule_2',
          agentId,
          userId,
          name: 'Priority Email Alert',
          description: 'Send notification for VIP emails',
          type: 'trigger',
          priority: 90,
          enabled: true,
          conditions: [
            {
              field: 'input.from',
              operator: 'contains',
              value: 'ceo@',
            },
          ],
          actions: [
            {
              type: 'send_notification',
              params: { channel: 'slack', urgent: true },
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setTimeout(() => {
        setRules(mockRules);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading rules:', error);
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    setRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
    // TODO: Call API to update rule
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    // TODO: Call API to delete rule
  };

  const ruleTypeColors = {
    trigger: 'from-blue-500 to-blue-600',
    condition: 'from-purple-500 to-purple-600',
    action: 'from-green-500 to-green-600',
    guardrail: 'from-red-500 to-red-600',
  };

  const ruleTypeIcons = {
    trigger: Zap,
    condition: CheckCircle,
    action: CheckCircle,
    guardrail: Shield,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-500" />
            Rules & Guardrails
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Define custom rules to control agent behavior
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-5 h-5" />
          Create Rule
        </motion.button>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : rules.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <Shield className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Rules Yet</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Create your first rule to control agent behavior
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold"
          >
            Create First Rule
          </motion.button>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence>
            {rules.map((rule, index) => {
              const Icon = ruleTypeIcons[rule.type];
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-slate-900 rounded-xl border-2 p-6 transition-all ${
                    rule.enabled
                      ? 'border-slate-200 dark:border-slate-800'
                      : 'border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ruleTypeColors[rule.type]} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">{rule.name}</h3>
                          <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded capitalize">
                            {rule.type}
                          </span>
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded">
                            Priority: {rule.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {rule.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => handleToggleRule(rule.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                      </label>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingRule(rule)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Conditions
                    </h4>
                    <div className="space-y-2">
                      {rule.conditions.map((condition, i) => (
                        <div
                          key={i}
                          className="text-sm px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-mono"
                        >
                          {condition.field} {condition.operator.replace('_', ' ')} {JSON.stringify(condition.value)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Actions
                    </h4>
                    <div className="space-y-2">
                      {rule.actions.map((action, i) => (
                        <div
                          key={i}
                          className="text-sm px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                        >
                          <span className="font-semibold">{action.type.replace('_', ' ')}</span>
                          {Object.keys(action.params).length > 0 && (
                            <span className="text-slate-600 dark:text-slate-400 ml-2">
                              ({JSON.stringify(action.params)})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(showCreateModal || editingRule) && (
          <RuleEditorModal
            rule={editingRule}
            onClose={() => {
              setShowCreateModal(false);
              setEditingRule(null);
            }}
            onSave={(rule) => {
              if (editingRule) {
                setRules(prev => prev.map(r => (r.id === rule.id ? rule : r)));
              } else {
                setRules(prev => [...prev, rule]);
              }
              setShowCreateModal(false);
              setEditingRule(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RuleEditorModal({
  rule,
  onClose,
  onSave,
}: {
  rule: Rule | null;
  onClose: () => void;
  onSave: (rule: Rule) => void;
}) {
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [type, setType] = useState<Rule['type']>(rule?.type || 'trigger');
  const [priority, setPriority] = useState(rule?.priority || 50);

  const handleSave = () => {
    const newRule: Rule = {
      id: rule?.id || `rule_${Date.now()}`,
      agentId: rule?.agentId || '',
      userId: rule?.userId || '',
      name,
      description,
      type,
      priority,
      enabled: rule?.enabled ?? true,
      conditions: rule?.conditions || [],
      actions: rule?.actions || [],
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newRule);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {rule ? 'Edit Rule' : 'Create Rule'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., No Late Night Emails"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this rule does..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Rule['type'])}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="trigger">Trigger</option>
                <option value="condition">Condition</option>
                <option value="action">Action</option>
                <option value="guardrail">Guardrail</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Priority: {priority}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Advanced condition and action builders coming soon! For now, rules can be created via API.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-800 rounded-lg font-medium"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={!name || !description}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Rule
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
