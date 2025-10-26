'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Paperclip,
  Loader2,
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  context?: {
    toolsUsed?: string[];
    knowledgeBaseResults?: number;
    memoryRetrieved?: number;
  };
}

interface ChatInterfaceProps {
  agentId: string;
  agentName?: string;
  initialMessages?: Message[];
  onSendMessage?: (message: string, attachments?: File[]) => Promise<void>;
}

export default function ChatInterface({
  agentId,
  agentName = 'AI Agent',
  initialMessages = [],
  onSendMessage,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      attachments: attachments.map(f => ({
        name: f.name,
        url: URL.createObjectURL(f),
        type: f.type,
      })),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          attachments: attachments.map(f => f.name),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: data.id || `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.content || data.message,
        timestamp: new Date().toISOString(),
        context: data.context,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    if (onSendMessage) {
      await onSendMessage(input, attachments);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{agentName}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={copyToClipboard}
              index={index}
            />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {file.name}
                </span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </motion.button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() && attachments.length === 0}
            className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  onCopy,
  index,
}: {
  message: Message;
  onCopy: (text: string) => void;
  index: number;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : ''}`}>
        <div
          className={`rounded-2xl p-4 ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-none'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
          }`}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-3 space-y-2">
              {message.attachments.map((att, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-white/10 rounded-lg"
                >
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Message Text */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Context Info */}
          {message.context && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-4 text-xs opacity-70">
              {message.context.toolsUsed && (
                <span>🔧 Tools: {message.context.toolsUsed.join(', ')}</span>
              )}
              {message.context.knowledgeBaseResults && (
                <span>📚 KB: {message.context.knowledgeBaseResults} results</span>
              )}
              {message.context.memoryRetrieved && (
                <span>🧠 Memory: {message.context.memoryRetrieved} items</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2 ml-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onCopy(message.content)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy"
            >
              <Copy className="w-4 h-4 text-slate-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Good response"
            >
              <ThumbsUp className="w-4 h-4 text-slate-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bad response"
            >
              <ThumbsDown className="w-4 h-4 text-slate-400" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </motion.button>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}
