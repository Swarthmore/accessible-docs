import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HTMLViewer from '../src/components/HTMLViewer'
import { useRouter } from 'next/router';
import axios from 'axios';
import { api } from '~/utils/api';

jest.mock('axios');
jest.mock('next/router');
jest.mock('~/utils/api');

describe('HTMLViewer Component', () => {
  const mockPush = jest.fn();
  const mockGeneratePdf = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the router
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        course: 'TestCourse',
        courseFolder: 'TestFolder',
        fileName: 'TestFile.html',
      },
      isReady: true,
      push: mockPush,
    });

    // Mock the API mutation
    (api.pdf.generatePdf.useMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockGeneratePdf,
      isLoading: false,
    });
  });

  test('renders loading state initially', () => {
    (useRouter as jest.Mock).mockReturnValue({
      isReady: false,
    });

    render(<HTMLViewer />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('fetches and displays content', async () => {
    const mockedHtmlContent = `
      <html>
        <head><title>Test Title</title></head>
        <body>
          <p>Test Content</p>
          <img src="image.jpg" alt="Test Image"/>
        </body>
      </html>
    `;

    (axios.get as jest.Mock).mockResolvedValue({ data: mockedHtmlContent });

    render(<HTMLViewer />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    // Check that the title is set
    expect(document.title).toBe('Test Title');

    // Check that the image src is updated
    const img = screen.getByAltText('Test Image');
    expect(img).toHaveAttribute(
      'src',
      'https://storage.googleapis.com/a11y/TestCourse/TestFolder/image.jpg'
    );
  });

  test('handles errors during content fetch', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

    render(<HTMLViewer />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Sorry, an error occurred while loading the content./i)
      ).toBeInTheDocument();
    });
  });

  test('handles "Go Back" button click', async () => {
    render(<HTMLViewer />);

    await waitFor(() => {
      // Ensure the content is loaded
    });

    const goBackButton = screen.getByRole('button', { name: /Go Back/i });
    fireEvent.click(goBackButton);

    expect(mockPush).toHaveBeenCalledWith('/#TestFolder');
  });

  test('handles "Download as PDF" button click', async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: '<p>Test Content</p>' });
    mockGeneratePdf.mockResolvedValue('base64pdfstring');

    render(<HTMLViewer />);

    await waitFor(() => {
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /Download as PDF/i });
    fireEvent.click(downloadButton);

    expect(mockGeneratePdf).toHaveBeenCalledWith({ htmlContent: expect.any(String) });
  });
});
