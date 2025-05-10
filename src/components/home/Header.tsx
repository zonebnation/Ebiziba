import React from 'react';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import * as Avatar from '@radix-ui/react-avatar';

// Define UserProfile type locally instead of importing it
interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
}

interface HeaderProps {
  user: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center"
    >
      <Avatar.Root className="w-12 h-12 shine cursor-pointer">
        {user ? (
          <Avatar.Image
            src={user.avatar_url}
            className="w-full h-full rounded-2xl object-cover"
          />
        ) : (
          <Avatar.Fallback className="w-full h-full bg-purple-600/30 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white">
            <User size={24} />
          </Avatar.Fallback>
        )}
      </Avatar.Root>
    </motion.div>
  );
};
