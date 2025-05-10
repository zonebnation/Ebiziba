import React, { useState, useEffect } from 'react';
import { Heart, Loader, AlertCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface MerchantCode {
  id: string;
  name: string;
  code: string;
  network: string;
}

export const DonationSection: React.FC = () => {
  const [merchantCodes, setMerchantCodes] = useState<MerchantCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [showAmountInput, setShowAmountInput] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchMerchantCodes();
  }, [retryCount]);

  const fetchMerchantCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we have network connectivity
      if (!navigator.onLine) {
        throw new Error('Tewali network connection');
      }

      const { data, error: supabaseError } = await supabase
        .from('merchant_codes')
        .select('*')
        .eq('active', true);

      if (supabaseError) throw supabaseError;
      
      if (!data) {
        throw new Error('Tewali merchant codes zizuuliddwa');
      }
      
      // Update merchant codes with correct values
      const updatedCodes = data.map(code => {
        if (code.network === 'MTN') {
          return { ...code, code: '862227' };
        } else if (code.network === 'Airtel') {
          return { ...code, code: '6776187' };
        }
        return code;
      });
      
      setMerchantCodes(updatedCodes);
    } catch (err: any) {
      console.error('Error fetching merchant codes:', err);
      setError('Waliwo ekisobu mu kusanga ennamba za mobile money');
      
      // Implement retry mechanism with exponential backoff
      if (retryCount < 3) {
        const timeout = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => setRetryCount(prev => prev + 1), timeout);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = (network: string, code: string) => {
    setShowAmountInput(network);
    setAmount('');
  };
  
  const handleSubmitDonation = (network: string, code: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Yingiza omuwendo omutuufu');
      return;
    }
    
    // Format depends on network
    let ussdCode = '';
    if (network === 'MTN') {
      ussdCode = `tel:*165*3*${code}*${amount}#`;
    } else if (network === 'Airtel') {
      ussdCode = `tel:*185*9*${code}*${amount}#`;
    }
    
    // Directly initiate the call
    window.location.href = ussdCode;
    
    // Reset state
    setShowAmountInput(null);
    setAmount('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="w-6 h-6 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => setRetryCount(prev => prev + 1)}
          className="mt-2 text-sm font-medium text-red-500 hover:text-red-600"
        >
          Gezaako Nate
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 space-y-4 mb-24" // Added margin bottom to prevent overlap with navigation
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl premium-gradient flex items-center justify-center">
          <Heart size={20} className="text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-surface-800 dark:text-white">
            Wetabe mu mulimu guno
          </h2>
          <p className="text-xs text-surface-500 dark:text-gray-400">
            Yamba Okusomesa Eddiini y'Obusiraamu
          </p>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm">
        Tukusaba Otuyambe mu mulimu guno mu ngeri'yonna esoboka.
      </p>

      <div className="space-y-3">
        {merchantCodes.map((merchant) => (
          <div key={merchant.id}>
            {showAmountInput === merchant.network ? (
              <div className="bg-white dark:bg-gray-700 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2">
                  <Heart size={18} className="text-secondary-500" />
                  <p className="font-medium">{merchant.network} Mobile Money</p>
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-300">
                    Yingiza omuwendo gw'oyagala okuwaayo (UGX)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-secondary-500"
                    autoFocus
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAmountInput(null)}
                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Sazaamu
                  </button>
                  <button
                    onClick={() => handleSubmitDonation(merchant.network, merchant.code)}
                    className="flex-1 py-2 px-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Phone size={16} />
                    <span>Waayo Kati</span>
                  </button>
                </div>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDonate(merchant.network, merchant.code)}
                className="w-full bg-secondary-500 hover:bg-secondary-600 text-white p-4 rounded-xl flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Heart size={20} className="text-white" />
                  <div className="text-left">
                    <p className="font-medium">{merchant.network} Mobile Money</p>
                    <p className="text-sm text-white/80">Merchant Code: {merchant.code}</p>
                  </div>
                </div>
                <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                  Kozesa
                </span>
              </motion.button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
