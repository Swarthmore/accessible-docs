import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AppBar, Toolbar, IconButton, Box, Avatar, Button, Tooltip } from '@mui/material';
import { useSession, signOut, signIn } from 'next-auth/react';
import LogoutIcon from '@mui/icons-material/Logout'; // Import Logout icon
import Image from 'next/image';
import SearchBarWithSuggestions from './SearchBarWithSuggestions';
import ThemeToggle from './ThemeToggle';
import { sign } from 'crypto';
// import { useColorMode } from '~/hooks/useColorMode';
import useColorMode from '~/hooks/useColorMode';
import SwarthmoreLogo from '~/assets/images/swarthmorelogo.png'

interface CourseItem {
  name: string;
  type: 'course' | 'coursefolder';
  children?: CourseItem[];
}

interface AppHeaderProps {
  onSearch: (query: string) => void;
  jsonData: CourseItem[];
}

const AppHeader: React.FC<AppHeaderProps> = ({ onSearch, jsonData }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
  // const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [colorMode, setColorMode] = useColorMode();

  useEffect(() => {
    if (modalOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setModalPosition({
        top: rect.bottom,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  }, [modalOpen]);

  const closeModal = () => setModalOpen(false);

  return (
    <>
      <AppBar position="sticky" className="bg-[#b30838] dark:bg-gray-800 z-30">
        <Toolbar className="flex justify-between items-center px-4">
          {/* Swarthmore Logo */}
          <IconButton className="focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 rounded-none" onClick={() => router.push('/')} aria-label="home">
            <Image src={SwarthmoreLogo} alt="Swarthmore Logo" width={120} height={70} />
          </IconButton>

          {/* Search Bar */}
          <div className="flex-grow mx-auto max-w-xl">
            <SearchBarWithSuggestions jsonData={jsonData} onSearch={onSearch} />
          </div>

          {/* Theme Toggle */}
          <div tabIndex={0} className="focus:outline-red-800">
            <ThemeToggle colorMode={colorMode} setColorMode={setColorMode} />
          </div>

          {/* Profile Icon */}
          <IconButton className="focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300" onClick={() => setModalOpen(!modalOpen)} aria-label="profile" ref={avatarRef}>
            <Avatar src={session?.user?.image} alt="Profile" imgProps={{ referrerPolicy: 'no-referrer' }} style={{ width: 48, height: 48 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" onClick={closeModal}></div>
          <div
            className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 p-6 overflow-auto max-h-[80vh] transition-transform transform-gpu scale-95 animate-scaleIn"
            style={{ top: `${modalPosition.top + 8}px`, right: `${modalPosition.right - 8}px` }}
          >
            {/* User info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar src={session?.user?.image} alt="Profile" imgProps={{ referrerPolicy: 'no-referrer' }} className="w-24 h-24 rounded-full border-4 border-transparent hover:border-gray-300 transition duration-300" />
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{session?.user?.name}</p>
              <p className="text-md text-gray-600 dark:text-gray-300">{session?.user?.email?.split('@')[0]}</p>
            </div>

            {/* Logout button  */}
            <Button
              startIcon={<LogoutIcon />}
              onClick={() => signOut()}
              fullWidth
              className="mt-6 bg-red-500 hover:bg-red-700 text-white font-medium py-2 rounded-md shadow transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Logout
            </Button>
          </div>
        </>
      )}

      <style jsx>{`
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  .animate-scaleIn {
    animation: scaleIn 0.25s ease-out forwards;
  }
`}</style>


    </>
  );
};

export default AppHeader;
