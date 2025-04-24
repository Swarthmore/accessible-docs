import { type AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from '../styles/theme'; 
import Layout from '../components/Layout'; 
import axios from 'axios';
import { useState, useEffect } from 'react';
import '../styles/globals.css'; 
import ScrollToTop from '~/components/ScrollToTop';
import Head from 'next/head';
import { api } from "~/utils/api";

const MyApp = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  const [data, setData] = useState([]);
  const [selectedKey, setSelectedKey] = useState('1');
  const [collapsed, setCollapsed] = useState(false);
  const storageUrl = 'https://storage.googleapis.com/a11y';
  const dataUrl = `${storageUrl}/data.json`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add a cache-busting query parameter
        const timestamp = new Date().getTime();
        const response = await axios.get(`${dataUrl}?timestamp=${timestamp}`);
        setData(response.data.children);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [  ]);

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ScrollToTop />
        <Layout
          data={data}
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          setCollapsed={setCollapsed}
          collapsed={collapsed}
        >
          <Head>
            <title>AccessibleDocs :: Swarthmore College</title>
          </Head>
          <Component {...pageProps} data={data} selectedKey={selectedKey} setSelectedKey={setSelectedKey} setCollapsed={setCollapsed} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
};
export default api.withTRPC(MyApp);
