import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * Custom hook for API calls with loading, error, and cleanup.
 * Lightweight wrapper that reduces boilerplate in components.
 */
export function useApi(apiFunc, options = {}) {
  const { onSuccess, onError, showSuccessToast = false, successMessage = '' } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFunc(...args);
      if (mountedRef.current) {
        setData(res.data);
        if (showSuccessToast) {
          toast.success(successMessage || 'Operation completed successfully');
        }
        if (onSuccess) onSuccess(res.data);
      }
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'An unexpected error occurred';
      if (mountedRef.current) {
        setError(message);
        toast.error(message);
        if (onError) onError(err);
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [apiFunc, onSuccess, onError, showSuccessToast, successMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Debounced search hook for search inputs.
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}