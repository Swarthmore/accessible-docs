import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import HTMLViewer from '~/components/HTMLViewer';
import { useSession } from 'next-auth/react'; 
import { useRouter } from 'next/router'; 
import ScrollToTopButton from '~/components/ScrollToTopButton';

const FileName = ({ data, selectedKey, setCollapsed, collapsed }) => {
  const { data: session, status } = useSession(); 
  const router = useRouter(); 

  useEffect(() => {
    // If the session is loading, return null (maybe display a loading spinner in the future???)
    if (status === 'loading') return;

    // If there is no session (user is not logged in), redirect to the home page
    if (status === 'unauthenticated') {
      router.push('/');
    }

    // If the user is authenticated and the sidebar is not collapsed, collapse it
    if (session && !collapsed) {
      setCollapsed(true);
    }
  }, [session, status, collapsed, setCollapsed, router]);

  return (
    <Box className="p-2">
      {session&& (<HTMLViewer />)}
      <ScrollToTopButton />
    </Box>
  );
};

export default FileName;
