import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ToastState {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
}

interface ToastContextType {
    toast: ToastState;
    showToast: (message: string, type: 'success' | 'error' | 'info') => void;
    hideToast: () => void;
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: '',
        type: 'success',
    });

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({
            visible: true,
            message,
            type,
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            visible: false,
        }));
    };

    const showSuccess = (message: string) => {
        showToast(message, 'success');
    };

    const showError = (message: string) => {
        showToast(message, 'error');
    };

    const showInfo = (message: string) => {
        showToast(message, 'info');
    };

    return (
        <ToastContext.Provider
            value={{
                toast,
                showToast,
                hideToast,
                showSuccess,
                showError,
                showInfo,
            }}
        >
            {children}
        </ToastContext.Provider>
    );
};
