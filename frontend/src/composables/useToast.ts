import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
    const removeToast = (id: string) => {
        const index = toasts.value.findIndex((t) => t.id === id);
        if (index > -1) {
            toasts.value.splice(index, 1);
        }
    };

    const runToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, message, type, duration };
        toasts.value.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const success = (message: string, duration?: number) => runToast(message, 'success', duration);
    const error = (message: string, duration?: number) => runToast(message, 'error', duration);
    const info = (message: string, duration?: number) => runToast(message, 'info', duration);
    const warning = (message: string, duration?: number) => runToast(message, 'warning', duration);

    return {
        toasts,
        addToast: runToast,
        removeToast,
        success,
        error,
        info,
        warning
    };
}
