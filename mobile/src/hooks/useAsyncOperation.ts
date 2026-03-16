import { useState, useRef, useEffect } from 'react';

export type AsyncOperationError = {
  message: string;
  code?: string;
  status?: number;
};

interface ExecuteOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: (error: AsyncOperationError) => void | Promise<void>;
}

export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState<string>('');
  const autoDismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearError = () => {
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current);
    }
    setErrorState(null);
    setErrorTitle('');
  };

  const setError = (message: string, title: string = 'Error') => {
    setErrorState(message);
    setErrorTitle(title);
  };

  const execute = async (
    asyncFn: () => Promise<any>,
    options?: ExecuteOptions
  ) => {
    setIsLoading(true);
    clearError();

    try {
      const result = await asyncFn();
      setIsLoading(false);
      
      if (options?.onSuccess) {
        await options.onSuccess();
      }
      
      return result;
    } catch (err: any) {
      setIsLoading(false);
      
      const errorObj: AsyncOperationError = {
        message: err?.message || 'An error occurred',
        code: err?.code,
        status: err?.status,
      };

      setError(errorObj.message, 'Error');

      if (options?.onError) {
        await options.onError(errorObj);
      }

      throw err;
    }
  };

  const setErrorWithAutoDismiss = (
    message: string,
    title: string = 'Error',
    autoDismissMsOrSeverity?: number | string
  ) => {
    setError(message, title);
    
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current);
    }

    // If a number is provided, use it as autoDismissMs
    const autoDismissMs = typeof autoDismissMsOrSeverity === 'number' ? autoDismissMsOrSeverity : 5000;

    if (autoDismissMs > 0) {
      autoDismissTimeoutRef.current = setTimeout(() => {
        clearError();
      }, autoDismissMs);
    }
  };

  useEffect(() => {
    return () => {
      if (autoDismissTimeoutRef.current) {
        clearTimeout(autoDismissTimeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    error,
    errorTitle,
    execute,
    clearError,
    setError: setErrorWithAutoDismiss,
    isSubmitting: isLoading,
  };
}
