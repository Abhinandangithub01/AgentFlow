'use client';

import { create } from 'zustand';
import { Toast, ToastType } from '@/components/notifications/Toast';

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: `toast-${Date.now()}-${Math.random()}`,
        },
      ],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}));

export function useToast() {
  const { addToast, removeToast, clearAll } = useToastStore();

  const toast = {
    success: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration });
    },
    error: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration });
    },
    warning: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration });
    },
    info: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration });
    },
    custom: (toast: Omit<Toast, 'id'>) => {
      addToast(toast);
    },
    dismiss: (id: string) => {
      removeToast(id);
    },
    dismissAll: () => {
      clearAll();
    },
  };

  return toast;
}
