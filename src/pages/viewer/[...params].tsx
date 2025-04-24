import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import cheerio from 'cheerio';
import Head from 'next/head';
import { Typography, Breadcrumbs, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GetAppIcon from '@mui/icons-material/GetApp';
import Link from 'next/link';
import { api } from "~/utils/api";
import styled from 'styled-components';
import { useSession } from 'next-auth/react';


const DocumentViewer = ({ data }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  if (status === "unauthenticated") {
    router.push("/");
  }
  const { mutateAsync: generatePdf, isLoading } = api.pdf.generatePdf.useMutation();
  const [content, setContent] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef(null);
  const { params } = router.query;

  useEffect(() => {
    if (!router.isReady || !params || params.length < 3) return;
    
    setLoading(true);
    setError(null);
    
    const [courseName, encodedFolderName, encodedFileName] = params;
    const folderName = decodeURIComponent(encodedFolderName);
    const fileName = decodeURIComponent(encodedFileName);
    
    const storageUrl = 'https://storage.googleapis.com/a11y';
    const url = `${storageUrl}/${courseName}/${folderName}/${fileName}`;

    axios.get(url)
      .then((res) => {
        const fetchedContent = res.data;
        const $ = cheerio.load(fetchedContent);

        // Adjust image paths
        $('img').each(function () {
          const oldSrc = $(this).attr('src');
          if (oldSrc && !oldSrc.startsWith('http')) {
            const newSrc = `${storageUrl}/${courseName}/${folderName}/${oldSrc}`;
            $(this).attr('src', newSrc);
          }
        });

        // Extract and set page title
        const title = $('title').text() || fileName.replace('.html', '');
        setPageTitle(title);
        $('title').remove();
        
        // Set content
        setContent($.html());
      })
      .catch((err) => {
        console.error('Error loading document:', err);
        setError('Failed to load document. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router.isReady, params]);

  const handleDownloadPDF = async () => {
    try {
      const base64pdf = await generatePdf({ htmlContent: content });
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64pdf}`;
      link.download = `${params?.[2] || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Go back to the course page
  const goBackToCourse = () => {
    if (params && params.length > 0) {
      router.push(`/${params[0]}`);
    } else {
      router.push('/');
    }
  };

  if (loading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading document...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </ErrorIcon>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Document
        </Typography>
        <Typography gutterBottom color="textSecondary">
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={goBackToCourse}
          sx={{ mt: 2 }}
        >
          Back to Course
        </Button>
      </ErrorContainer>
    );
  }

  return (
    <Container>
      <Head>
        <title>{`${pageTitle} :: AccessibleDocs :: Swarthmore College` || 'Document Viewer'}</title>
      </Head>

      <ContentWrapper>
        <NavigationHeader>
          <StyledBreadcrumbs aria-label="breadcrumb" className="mb-4">
            <Link href="/" passHref legacyBehavior>
              <BreadcrumbLink>
                <HomeIcon fontSize="small" />
              </BreadcrumbLink>
            </Link>
            {params && params.length > 0 && (
              <Link href={`/${params[0]}`} passHref legacyBehavior>
                <BreadcrumbLink>
                  {params[0]}
                </BreadcrumbLink>
              </Link>
            )}
            {params && params.length > 1 && (
              <Typography  className="text-truncate max-w-xs dark:text-white "  sx={{ color: 'inherit' }}>
                {decodeURIComponent(params[2]).replace('.html', '')}
              </Typography>
            )}
          </StyledBreadcrumbs>

          {/* <DocumentTitle variant="h4">
            {pageTitle || (params && params.length > 2 ? decodeURIComponent(params[2]).replace('.html', '') : 'Document')}
          </DocumentTitle> */}
        </NavigationHeader>

        <DocumentContent
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: content }}
        />

        <ActionButtonsContainer>
          <ActionButton
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={goBackToCourse}
            aria-label="Go back to course"
            className="back-button"
          >
            Back to Course
          </ActionButton>
          <ActionButton
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadPDF}
            disabled={isLoading}
            aria-label="Download as PDF"
            className="download-button"
          >
            Download PDF
          </ActionButton>
        </ActionButtonsContainer>
      </ContentWrapper>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ContentWrapper = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25), 0 5px 15px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  
  .dark & {
    background-color: #1e293b;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const NavigationHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  .dark & {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const StyledBreadcrumbs = styled(Breadcrumbs)`
  .MuiBreadcrumbs-separator {
    color: #666;
    
    .dark & {
      color: #00FFFF;
    }
  }
`;

const DocumentTitle = styled(Typography)`
  margin-top: 0.75rem;
  font-weight: 600;
  color: #333;
  
  .dark & {
    color: #f3f4f6;
  }
`;

const BreadcrumbLink = styled.a`
  display: flex;
  align-items: center;
  color: #3b82f6; /* Changed from pink to blue */
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
    color: #2563eb; /* Darker blue on hover */
  }
  
  .dark & {
    color: #00FFFF; /* Lighter blue for dark mode */
    
    &:hover {
      color: #93c5fd; /* Even lighter blue on hover in dark mode */
    }
  }
`;

const DocumentContent = styled.div`
  padding: 2rem;
  overflow-x: auto;
  color: #333;
  line-height: 1.6;
  
  /* Basic HTML content styling */
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
    color: #111;
  }
  
  p {
    margin-bottom: 1.25rem;
  }
  
  a {
    color: #3b82f6; /* Updated from pink to blue */
    text-decoration: underline;
  }
  
  ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin: 1.5rem 0;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid #3b82f6; /* Changed from pink to blue */
    background-color: #f8f8f8;
    color: #555;
    font-style: italic;
  }
  
  code {
    background-color: #f1f1f1;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }
  
  pre {
    background-color: #f1f1f1;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
  }
  
  th, td {
    border: 1px solid #e0e0e0;
    padding: 0.75rem;
    text-align: left;
  }
  
  th {
    background-color: #f5f5f5;
    font-weight: bold;
  }
  
  /* Dark mode styling */
  .dark & {
    color: #e5e7eb;
    
    h1, h2, h3, h4, h5, h6 {
      color: #f3f4f6;
    }
    
    a {
      color: #60a5fa; /* Lighter blue for dark mode */
    }
    
    blockquote {
      background-color: #2a3546;
      border-left-color: #60a5fa; /* Lighter blue for dark mode */
      color: #d1d5db;
    }
    
    code, pre {
      background-color: #2d3748;
    }
    
    table, th, td {
      border-color: #4b5563;
    }
    
    th {
      background-color: #374151;
    }
    
    img {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  gap: 1rem;
  flex-wrap: wrap;
  
  .dark & {
    border-top-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    flex-direction: column;
  }
`;

const ActionButton = styled(Button)`
  &.back-button {
    background-color: #3b82f6; /* Changed from red to blue */
    
    &:hover {
      background-color: #2563eb; /* Darker blue on hover */
    }
    
    .dark & {
      background-color: #1d4ed8;
      
      &:hover {
        background-color: #1e40af;
      }
    }
  }
  
  &.download-button {
    background-color: #2c7a7b;
    
    &:hover {
      background-color: #24676a;
    }
    
    .dark & {
      background-color: #065f60;
      
      &:hover {
        background-color: #044e4f;
      }
    }
  }
  
  &:focus-visible {
    outline: 2px solid #FFD700;
    outline-offset: 2px;
    
    .dark & {
      outline-color: #FFB700;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 50vh;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
`;

const ErrorIcon = styled.div`
  width: 64px;
  height: 64px;
  color: #ef4444; /* Changed from pink to red */
  margin-bottom: 1.5rem;
  
  .dark & {
    color: #f87171; /* Lighter red for dark mode */
  }
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(0, 0, 0, 0.1);
  border-top-color: #3b82f6; /* Changed from pink to blue */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .dark & {
    border-color: rgba(255, 255, 255, 0.1);
    border-top-color: #60a5fa; /* Lighter blue for dark mode */
  }
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 1.1rem;
  
  .dark & {
    color: #9ca3af;
  }
`;

export default DocumentViewer;