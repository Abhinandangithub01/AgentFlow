'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Plus, Trash2, Edit, Flag, Calendar, Loader2 } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  category?: string;
}

export default function TasksWidget({ agentId }: { agentId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    loadTasks();
  }, [agentId]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Review pull requests',
          completed: false,
          priority: 'high',
          dueDate: 'Today',
          category: 'Development',
        },
        {
          id: '2',
          title: 'Update documentation',
          completed: true,
          priority: 'medium',
          category: 'Documentation',
        },
        {
          id: '3',
          title: 'Team meeting at 3pm',
          completed: false,
          priority: 'high',
          dueDate: 'Today',
          category: 'Meetings',
        },
        {
          id: '4',
          title: 'Prepare presentation',
          completed: false,
          priority: 'medium',
          dueDate: 'Tomorrow',
          category: 'Work',
        },
        {
          id: '5',
          title: 'Code review feedback',
          completed: true,
          priority: 'low',
          category: 'Development',
        },
      ];

      setTimeout(() => {
        setTasks(mockTasks);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setIsLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const handleToggleTask = async (taskId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );

    // TODO: Call API to update task
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');

    // TODO: Call API to create task
  };

  const handleDeleteTask = async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));

    // TODO: Call API to delete task
  };

  const priorityColors = {
    high: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    medium: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    low: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  };

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Tasks</span>
          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full">
            {activeCount}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'completed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-lg transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'active' && ` (${activeCount})`}
            {f === 'completed' && ` (${completedCount})`}
          </button>
        ))}
      </div>

      {/* Add Task */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-auto space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <CheckCircle className="w-12 h-12 mb-2" />
            <p className="text-sm">
              {filter === 'completed' ? 'No completed tasks' : 'No tasks yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.03 }}
                className={`group p-3 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 hover:text-blue-500 transition-colors" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span
                        className={`text-sm ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      {!task.completed && task.priority === 'high' && (
                        <Flag className="w-3 h-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Metadata */}
                    {(task.dueDate || task.category) && (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate}</span>
                          </div>
                        )}
                        {task.category && (
                          <span className={`px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                            {task.category}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Stats */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>{activeCount} active</span>
            <span>{completedCount} completed</span>
            <span>{Math.round((completedCount / tasks.length) * 100)}% done</span>
          </div>
        </div>
      )}
    </div>
  );
}
