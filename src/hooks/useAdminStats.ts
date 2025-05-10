import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AdminStats {
  totalBooks: number;
  totalVideos: number;
  totalUsers: number;
  totalRevenue: number;
  loading: boolean;
  error: string | null;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalBooks: 0,
    totalVideos: 0,
    totalUsers: 0,
    totalRevenue: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      // Fetch total books
      const { count: totalBooks, error: booksError } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      if (booksError) throw booksError;

      // Fetch total videos
      const { count: totalVideos, error: videosError } = await supabase
        .from('reels')
        .select('*', { count: 'exact', head: true });

      if (videosError) throw videosError;

      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Fetch total revenue
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      const totalRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      setStats({
        totalBooks: totalBooks || 0,
        totalVideos: totalVideos || 0,
        totalUsers: totalUsers || 0,
        totalRevenue,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch statistics'
      }));
    }
  };

  const refreshStats = () => {
    fetchStats();
  };

  return { ...stats, refreshStats };
}
