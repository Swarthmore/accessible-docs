import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from '../styles/theme';
import Layout from '../components/Layout';
import axios from 'axios';
import { useState, useEffect } from 'react';
import '../styles/globals.css';
import ScrollToTop from '~/components/ScrollToTop';
import AppFooter from '~/components/Footer';
import Head from 'next/head';

const MyApp = ({ Component, pageProps: { session, ...pageProps } }: AppProps) => {
  const [data, setData] = useState([]);
  const [selectedKey, setSelectedKey] = useState('1');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/data.json');
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
            <title>Swarthmore A11yGator</title>
          </Head>
          <Component {...pageProps} data={data} selectedKey={selectedKey} setSelectedKey={setSelectedKey} setCollapsed={setCollapsed} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default MyApp;
