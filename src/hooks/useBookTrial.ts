import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { getDeviceFingerprint, detectDeviceModification } from '../lib/device-fingerprint';

type Book = Database['public']['Tables']['books']['Row'];

interface TrialStatus {
  isEligible: boolean;
  isActive: boolean;
  trialEnd?: string;
  message?: string;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export function useBookTrial() {
  const [deviceId, setDeviceId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [deviceModified, setDeviceModified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDeviceId = async () => {
      try {
        setIsLoading(true);
        // Check for device modification
        const isModified = detectDeviceModification();
        if (isModified) {
          setDeviceModified(true);
          setError('Device modification detected. Trials are disabled.');
          return;
        }

        // Get device fingerprint
        const fingerprint = await getDeviceFingerprint();
        setDeviceId(fingerprint);

        // Store device info
        storeDeviceInfo(fingerprint);
      } catch (err) {
        console.error('Error initializing device ID:', err);
        setError('Failed to initialize device. Using fallback ID.');
        const fallbackId = localStorage.getItem('device_id') || crypto.randomUUID();
        localStorage.setItem('device_id', fallbackId);
        setDeviceId(fallbackId);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDeviceId();
  }, []);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
    retryDelay = INITIAL_RETRY_DELAY
  ): Promise<T> => {
    try {
      return await fn();
    } catch (err) {
      if (retries === 0) throw err;
      await delay(retryDelay);
      return retryWithBackoff(fn, retries - 1, retryDelay * 2);
    }
  };

  const storeDeviceInfo = (deviceId: string) => {
    try {
      const deviceInfo = {
        id: deviceId,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('device_info', JSON.stringify(deviceInfo));
    } catch (err) {
      console.error('Error storing device info:', err);
      setError('Failed to store device info.');
    }
  };

  const checkTrialStatus = async (book: Book): Promise<TrialStatus> => {
    if (isLoading) {
      return { isEligible: false, isActive: false, message: 'Loading device information...' };
    }
    if (!book?.id) {
      return { isEligible: false, isActive: false, message: 'Invalid book data' };
    }
    if (deviceModified) {
      return { isEligible: false, isActive: false, message: 'Device modification detected.' };
    }

    try {
      // Check if trial is active
      const { data: isActive, error: activeError } = await retryWithBackoff(() =>
        supabase.rpc('is_trial_active', { p_device_id: deviceId, p_book_id: book.id })
      );
      if (activeError) throw activeError;

      if (isActive) {
        const { data: trial, error: trialError } = await retryWithBackoff(() =>
          supabase
            .from('book_trials')
            .select('trial_end')
            .eq('device_id', deviceId)
            .eq('book_id', book.id)
            .maybeSingle()
        );
        if (trialError) throw trialError;

        return { isEligible: false, isActive: true, trialEnd: trial?.trial_end };
      }

      // Check trial eligibility
      const { data: isEligible, error: eligibilityError } = await retryWithBackoff(() =>
        supabase.rpc('check_trial_eligibility', { p_device_id: deviceId, p_book_id: book.id })
      );
      if (eligibilityError) throw eligibilityError;

      return { isEligible: !!isEligible, isActive: false };
    } catch (err) {
      console.error('Error checking trial status:', err);
      return { isEligible: false, isActive: false, message: 'Failed to check trial status.' };
    }
  };

  const startTrial = async (book: Book, userId: string): Promise<TrialStatus> => {
    if (isLoading) {
      return { isEligible: false, isActive: false, message: 'Loading device information...' };
    }
    if (!book?.id) {
      return { isEligible: false, isActive: false, message: 'Invalid book data' };
    }
    if (!userId) {
      return { isEligible: false, isActive: false, message: 'User must be logged in.' };
    }
    if (deviceModified) {
      return { isEligible: false, isActive: false, message: 'Device modification detected.' };
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return { isEligible: false, isActive: false, message: 'Invalid user ID format.' };
    }
    if (!uuidRegex.test(book.id)) {
      return { isEligible: false, isActive: false, message: 'Invalid book ID format.' };
    }

    try {
      const { data: result, error } = await retryWithBackoff(() =>
        supabase.rpc('start_book_trial', {
          p_user_id: userId,
          p_device_id: deviceId,
          p_book_id: book.id,
        })
      );
      if (error) throw error;

      if (!result?.success) {
        return { isEligible: false, isActive: false, message: result?.message || 'Could not start trial.' };
      }

      return { isEligible: false, isActive: true, trialEnd: result.trial_end, message: 'Trial started successfully.' };
    } catch (err) {
      console.error('Error starting trial:', err);
      return { isEligible: false, isActive: false, message: 'Failed to start trial.' };
    }
  };

  return { deviceId, isLoading, deviceModified, error, checkTrialStatus, startTrial };
}
