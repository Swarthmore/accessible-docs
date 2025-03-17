// components/layout.tsx
import { useSession } from 'next-auth/react';
import { Box, CircularProgress } from '@mui/material';
import AppHeader from './Header';
import Sidebar from './Sidebar';
import AppFooter from './Footer';
import { cn } from '~/utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  data: any[];
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  setCollapsed: (collapsed: boolean) => void;
    collapsed: boolean;
}

const Layout = ({ children, data, selectedKey, setSelectedKey, setCollapsed, collapsed }: LayoutProps) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <div className='spinner' ></div>
      </Box>
    );
  }

  if (!session) {
    return <>
    {children}
    <AppFooter />
    </>; // Render only the children when not logged in
  }

  return (
    <div className={cn(['flex', 'flex-col', 'h-screen', 'max-h-screen', 'max-w-screen', 'w-screen'])}>
      <Box component="nav" className={`shrink-0 dark:bg-black`}>
      <Sidebar
        data={data}
        selectedKey={selectedKey}
        setSelectedKey={setSelectedKey}
        collapsed={collapsed}
        handleDrawerToggle={() => setCollapsed((prev) => !prev)}
        drawerWidth={240}
      />
      </Box>
      <Box component="main" className={`grow dark:bg-black ${collapsed ? 'ml-0' : 'ml-[240px]'}`}>
        <AppHeader onSearch={() => {}} jsonData={data} />
        {children}
        <AppFooter />
      </Box>
    </div>
  );
};

export default Layout;
