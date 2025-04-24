// components/layout.tsx
import { useSession } from 'next-auth/react';
import { Box } from '@mui/material';
import AppHeader from './Header';
import AppFooter from './Footer';
import Loader from './Loader';
import { useState, useEffect } from 'react';
import Router from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
  data: any[];
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  setCollapsed: (collapsed: boolean) => void;
  collapsed: boolean;
}

// This script will run on the client-side immediately when included
if (typeof window !== 'undefined') {
  // Create a global loading state in localStorage
  localStorage.setItem('isLoading', 'true');
  
  // Set a timeout to clear the loading state (ensures it doesn't get stuck)
  setTimeout(() => {
    localStorage.setItem('isLoading', 'false');
  }, 3000);
}

const Layout = ({ children, data, selectedKey, setSelectedKey, setCollapsed, collapsed }: LayoutProps) => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize state from localStorage on first render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force the loader to show immediately on page load 
      document.body.style.visibility = 'hidden';
      
      // Set timer for minimum display time
      const initialLoadTimer = setTimeout(() => {
        setIsLoading(false);
        document.body.style.visibility = 'visible';
        localStorage.setItem('isLoading', 'false');
      }, 1500);
      
      return () => {
        clearTimeout(initialLoadTimer);
        document.body.style.visibility = 'visible';
      };
    }
  }, []);
  
  // Set up router events to guarantee loader display on navigation
  useEffect(() => {
    const showLoader = () => {
      setIsLoading(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoading', 'true');
      }
    };
    
    const hideLoader = () => {
      // Add delay to ensure loader shows for at least 1.5 seconds
      setTimeout(() => {
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoading', 'false');
        }
      }, 700);
    };
    
    // Set up router event listeners for page navigation
    Router.events.on('routeChangeStart', showLoader);
    Router.events.on('routeChangeComplete', hideLoader);
    Router.events.on('routeChangeError', hideLoader);
    
    // Handle page refresh with beforeunload
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoading', 'true');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Clean up event listeners
    return () => {
      Router.events.off('routeChangeStart', showLoader);
      Router.events.off('routeChangeComplete', hideLoader);
      Router.events.off('routeChangeError', hideLoader);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  // Force loader to show when NextAuth is loading
  useEffect(() => {
    if (status === "loading") {
      setIsLoading(true);
    }
  }, [status]);

  // Always show loader when loading state is true
  if (isLoading || status === "loading" || (typeof window !== 'undefined' && localStorage.getItem('isLoading') === 'true')) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh" 
        width="100vw"
        className="fixed inset-0 z-[9999] dark:bg-black bg-white"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
      >
        <Loader />
      </Box>
    );
  }

  // Layout for non-authenticated users
  if (!session) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Box sx={{ flex: 1 }}>
          {children}
        </Box>
        <AppFooter />
      </Box>
    );
  }

  // Layout for authenticated users
  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex', 
        flexDirection: 'column' 
      }} 
      className='dark:bg-black'
    >
      <AppHeader onSearch={() => {}} jsonData={data} />
      <Box 
        component="main" 
        sx={{ flex: 1 }}
        className="dark:bg-black"
      >
        {children}
      </Box>
      <AppFooter />
    </Box>
  );
};

export default Layout;