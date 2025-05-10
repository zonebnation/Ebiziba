import React, { useState } from 'react';
import { Mail, Lock, Loader, User, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { isAndroidPlatform } from '../lib/google-auth';
import { GoogleSignInButton } from './GoogleSignInButton';

interface LoginProps {
  onSuccess?: () => void;
  isModal?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, isModal = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, isLoading, googleLogin } = useAuth();
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        onSuccess?.();
      } else {
        if (!name.trim()) {
          setError('Erinnya lyetaagisa');
          return;
        }
        await signup(name, email, password);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || (isLogin ? 'Email oba password siituufu' : 'Okwewandiisa kugaanye'));
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      setIsGoogleLoading(true);
      setError('');

      const decoded = jwtDecode<{
        email: string;
        sub: string;
        name: string;
        picture?: string;
      }>(credentialResponse.credential);
      
      const { email, sub: googleUserId, name, picture } = decoded;

      const googleData = {
        token: credentialResponse.credential,
        googleUserId,
        email,
        name,
        picture
      };
      
      console.log('Google login data:', googleData);
      
      // Use the googleLogin function from AuthContext
      await googleLogin(googleData);
      onSuccess?.();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err.message || 'Okuyingira mu Google kugaanye');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    const errorMsg = 'Okuyingira mu Google kugaanye. Gezaako nate.';
    setError(errorMsg);
  };

  // Check if we're on Android platform
  const isAndroid = isAndroidPlatform();

  return (
    <div className={isModal ? "" : "p-4 flex flex-col items-center justify-center min-h-[80vh]"}>
      <div className="w-full max-w-sm mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {!isModal && (
              <>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
                  {isLogin ? 'Tukwanilizza Nate' : 'Kolawo Akawunti'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
                  {isLogin ? 'Yingira osobole okweyongera okuyiga' : 'Wewandiise osobole okutandika okuyiga'}
                </p>
              </>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="buttons-container mb-6">
              {isAndroid ? (
                <GoogleSignInButton 
                  onSuccess={onSuccess}
                  onError={(errorMsg) => setError(errorMsg)}
                />
              ) : (
                <div className="google-login-button w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap={false}
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                    theme={theme === 'dark' ? 'filled_black' : 'outline'}
                    locale="en"
                    context={isAndroid ? 'use' : 'signin'}
                  />
                </div>
              )}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Oba kozesa email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Erinnya Lyonna
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Wandiika erinnya lyo lyonna"
                    />
                    <User className="absolute left-3 top-2.5 text-gray-400" size={20} />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Wandiika email yo"
                    required
                  />
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Wandiika password yo"
                    required
                  />
                  <Lock className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Kikolebwa...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>{isLogin ? 'Yingira' : 'Wewandiise'}</span>
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {isLogin ? "Tolina akawunti?" : "Olina dda akawunti?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  {isLogin ? 'Wewandiise' : 'Yingira'}
                </button>
              </p>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
