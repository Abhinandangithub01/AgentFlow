'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  type: 'success' | 'warning' | 'info' | 'action_required';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  children?: React.ReactNode;
}

const ActivityCard = ({
  type,
  icon,
  title,
  description,
  timestamp,
  children,
}: ActivityCardProps) => {
  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success-50 border-success-200';
      case 'warning': return 'bg-warning-50 border-warning-200';
      case 'info': return 'bg-primary-50 border-primary-200';
      case 'action_required': return 'bg-danger-50 border-danger-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('border-2 rounded-xl p-5', getBgColor(type))}
    >
      <div className="flex items-start space-x-4">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-700">{description}</p>
            </div>
            <span className="text-xs text-gray-600 whitespace-nowrap ml-4">
              {timestamp}
            </span>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
