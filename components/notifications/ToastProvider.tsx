'use client';

import { ToastContainer } from './Toast';
import { useToastStore } from '@/hooks/useToast';

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return <ToastContainer toasts={toasts} onClose={removeToast} position="top-right" />;
}
