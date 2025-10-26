'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Plus,
  Upload,
  FileText,
  Link,
  Code,
  Search,
  Trash2,
  Edit,
  Check,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface KnowledgeBase {
  id: string;
  name: string;
  type: 'documents' | 'database' | 'api' | 'custom';
  documentCount: number;
  size: string;
  status: 'active' | 'indexing' | 'error';
  lastUpdated: string;
}

export default function KnowledgeBaseManager() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([
    {
      id: '1',
      name: 'Company Documentation',
      type: 'documents',
      documentCount: 47,
      size: '12.4 MB',
      status: 'active',
      lastUpdated: '2 hours ago',
    },
    {
      id: '2',
      name: 'Customer Database',
      type: 'database',
      documentCount: 1203,
      size: '45.2 MB',
      status: 'active',
      lastUpdated: '1 day ago',
    },
    {
      id: '3',
      name: 'API Documentation',
      type: 'api',
      documentCount: 23,
      size: '3.1 MB',
      status: 'indexing',
      lastUpdated: 'Just now',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredKBs = knowledgeBases.filter(kb =>
    kb.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-500" />
            Knowledge Bases
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Add documents, databases, and APIs for your agent to reference
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Create Knowledge Base
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search knowledge bases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Knowledge Bases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredKBs.map((kb, index) => (
            <KnowledgeBaseCard key={kb.id} kb={kb} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredKBs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Database className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
            No knowledge bases found
          </h3>
          <p className="text-slate-500 dark:text-slate-500">
            {searchQuery ? 'Try a different search term' : 'Create your first knowledge base to get started'}
          </p>
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateKnowledgeBaseModal onClose={() => setShowCreateModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function KnowledgeBaseCard({ kb, index }: { kb: KnowledgeBase; index: number }) {
  const typeIcons = {
    documents: FileText,
    database: Database,
    api: Link,
    custom: Code,
  };

  const typeColors = {
    documents: 'from-blue-500 to-blue-600',
    database: 'from-purple-500 to-purple-600',
    api: 'from-green-500 to-green-600',
    custom: 'from-orange-500 to-orange-600',
  };

  const statusColors = {
    active: 'bg-green-500',
    indexing: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  const Icon = typeIcons[kb.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColors[kb.type]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{kb.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{kb.type}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Documents</p>
          <p className="font-semibold">{kb.documentCount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Size</p>
          <p className="font-semibold">{kb.size}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColors[kb.status]}`} />
            <p className="font-semibold capitalize text-sm">{kb.status}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Updated {kb.lastUpdated}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
        >
          View Details
          <Sparkles className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
}

function CreateKnowledgeBaseModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [kbType, setKbType] = useState<'documents' | 'database' | 'api' | 'custom'>('documents');
  const [kbName, setKbName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const kbTypes = [
    {
      type: 'documents' as const,
      icon: FileText,
      title: 'Documents',
      description: 'Upload PDFs, docs, and text files',
      color: 'blue',
    },
    {
      type: 'database' as const,
      icon: Database,
      title: 'Database',
      description: 'Connect to SQL or NoSQL databases',
      color: 'purple',
    },
    {
      type: 'api' as const,
      icon: Link,
      title: 'API',
      description: 'Fetch data from REST APIs',
      color: 'green',
    },
    {
      type: 'custom' as const,
      icon: Code,
      title: 'Custom',
      description: 'Build your own integration',
      color: 'orange',
    },
  ];

  const handleCreate = async () => {
    setIsCreating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsCreating(false);
    onClose();
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
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Create Knowledge Base</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= s
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {step > s ? <Check className="w-5 h-5" /> : s}
                </div>
                <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  {step > s && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="h-full bg-blue-500"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Knowledge Base Name</label>
                <input
                  type="text"
                  value={kbName}
                  onChange={(e) => setKbName(e.target.value)}
                  placeholder="e.g., Company Documentation"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Select Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {kbTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = kbType === type.type;
                    
                    return (
                      <motion.button
                        key={type.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setKbType(type.type)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`} />
                        <h4 className="font-semibold mb-1">{type.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{type.description}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <Upload className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Drag and drop files or click to browse
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Browse Files
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => step < 2 ? setStep(step + 1) : handleCreate()}
            disabled={!kbName || isCreating}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : step < 2 ? (
              'Next'
            ) : (
              'Create Knowledge Base'
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
