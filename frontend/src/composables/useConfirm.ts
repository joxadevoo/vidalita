import { ref } from 'vue';

type ConfirmCallback = (result: boolean) => void;

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

const isOpen = ref(false);
const options = ref<ConfirmOptions>({ message: '' });
let resolvePromise: ConfirmCallback | null = null;

export function useConfirm() {
    const confirm = (opts: ConfirmOptions | string): Promise<boolean> => {
        if (typeof opts === 'string') {
            options.value = { message: opts };
        } else {
            options.value = opts;
        }
        isOpen.value = true;
        return new Promise((resolve) => {
            resolvePromise = resolve;
        });
    };

    const proceed = () => {
        isOpen.value = false;
        if (resolvePromise) resolvePromise(true);
    };

    const cancel = () => {
        isOpen.value = false;
        if (resolvePromise) resolvePromise(false);
    };

    return {
        isOpen,
        options,
        confirm,
        proceed,
        cancel
    };
}
