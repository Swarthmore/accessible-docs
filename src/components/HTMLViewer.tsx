import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Head from 'next/head';
import { Typography, Breadcrumbs, Button, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Link from 'next/link';
import { api } from "~/utils/api";

const HTMLViewer = () => {

  const { mutateAsync: generatePdf, isLoading } = api.pdf.generatePdf.useMutation();
  const [content, setContent] = useState<string>('');
  const [pageTitle, setPageTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const contentRef = useRef(null);  // Reference to the div that holds the HTML content
  const router = useRouter();
  const { course, courseFolder, fileName } = router.query as { course: string; courseFolder?: string; fileName: string };
  const storageUrl = 'https://storage.googleapis.com/a11y';

  useEffect(() => {
    if (!router.isReady) return;
    setLoading(true);


    const url = `${storageUrl}/${course}/${courseFolder}/${fileName}`;

    // console.info('Fetching content from:', url);

    axios.get(url)
      .then((res) => {
        const fetchedContent = res.data;
        const $ = cheerio.load(fetchedContent);

        // Adjust image paths
        $('img').each(function () {
            const oldSrc = $(this).attr('src');
            const newSrc = `${storageUrl}/${course}/${courseFolder}/${oldSrc}`;
            $(this).attr('src', newSrc);
        });
        const title = $('title').text();
        setPageTitle(title);
        $('title').remove();
        setContent($.html());
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setContent('<p class="text-red-500 dark:text-red-300">Sorry, an error occurred while loading the content.</p>');
        setLoading(false); 
      });
  }, [router.isReady, course, courseFolder, fileName]);

  const handleDownloadPDF = async () => {
    try {
      const base64pdf = await generatePdf({ htmlContent: content });
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${base64pdf}`;
      link.download = `${fileName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-white">
        <div className="spinner"/>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-800 border border-gray-400 dark:border-gray-600 shadow-2xl m-8 rounded-lg" tabIndex={0} aria-label="HTML content viewer">
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <Breadcrumbs aria-label="breadcrumb" className="mb-4 text-gray-800 dark:text-gray-200">
        <Link legacyBehavior href="/" passHref>
          <a className="flex items-center dark:text-[#22d3ee] hover:text-gray-600 dark:hover:text-gray-400"><HomeIcon /></a>
        </Link>
        <Link legacyBehavior href={`/#${course}`} passHref>
          <a className="text-blue-600 dark:text-[#22d3ee] hover:text-blue-800 dark:hover:text-blue-300">{course}</a>
        </Link>
        {courseFolder && (
          <Link legacyBehavior href={`/#${courseFolder}`} passHref>
            <a className="text-blue-600 dark:text-[#22d3ee] hover:text-blue-800 dark:hover:text-blue-300">{courseFolder}</a>
          </Link>
        )}
        <Typography color="textPrimary" className="text-gray-800 dark:text-gray-200">{fileName}</Typography>
      </Breadcrumbs>

      <Box
        ref={contentRef}
        dangerouslySetInnerHTML={{ __html: content }}
        className="html-content text-gray-900 dark:text-gray-100"
      />

      <Button
        startIcon={<ArrowBackIosIcon />}
        onClick={() => router.push(`/#${courseFolder || course}`)}
        className="mt-4 bg-blue-600 hover:bg-blue-800 text-white"
        aria-label="Go back"
      >
        Go Back
      </Button>
      <Button
        onClick={handleDownloadPDF}
        className="mt-4 ml-4 bg-green-500 hover:bg-green-700 text-white"
        aria-label="Download as PDF"
        disabled={isLoading}
      >
        Download as PDF
      </Button>
    </div>
  );
};

export default HTMLViewer;
