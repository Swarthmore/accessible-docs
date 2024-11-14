import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import Unauthorized from '~/components/Unauthorized';

interface FileData {
  name: string;
  type: string;
  file: File;
}

const UploadFiles: React.FC = () => {
  const { data: session } = useSession();

  if (session?.user.role !== 'UPLOADER' && session?.user.role !== 'ADMIN') {
    return <Unauthorized />;
  }

  const [filesData, setFilesData] = useState<FileData[]>([]);
  const [destFolderName, setDestFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileDataArray: FileData[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData: FileData = {
          name: file.name,
          type: file.type,
          file: file,
        };
        fileDataArray.push(fileData);
      }
      setFilesData(fileDataArray);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const fileDataArray: FileData[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileData: FileData = {
        name: file.name,
        type: file.type,
        file: file,
      };
      fileDataArray.push(fileData);
    }
    setFilesData(fileDataArray);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (!filesData.length || !destFolderName) {
      alert('Please select files and provide the destination folder name.');
      return;
    }
    setIsModalOpen(true);
  };

  const confirmUpload = async () => {
    try {
      setIsLoading(true);
      setIsModalOpen(false);

      const formData = new FormData();
      formData.append('destFolderName', destFolderName);

      filesData.forEach((fileData) => {
        formData.append('files', fileData.file);
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        alert('Files uploaded successfully');
        setFilesData([]);
        setDestFolderName('');
      } else {
        let errorMessage = 'An error occurred while uploading the files.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          errorMessage = errorText || errorMessage;
        }
        alert(`Error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('An unexpected error occurred while uploading the files.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">
        Upload Files to A11yGator
      </h1>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-10 text-center cursor-pointer mb-4 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Click or drag and drop files here
        </p>
      </div>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileInputChange}
      />
      <div className="mb-4">
        <TextField
          label="Destination Folder"
          variant="outlined"
          fullWidth
          value={destFolderName}
          onChange={(e) => setDestFolderName(e.target.value)}
          InputLabelProps={{ className: 'dark:text-gray-300 ' }}
          InputProps={{
            className:
              'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200',
          }}
        />
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={isLoading}
        startIcon={
          isLoading ? <CircularProgress size={20} color="inherit" /> : null
        }
        className="dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        {isLoading ? 'Uploading...' : 'Upload Files'}
      </Button>

      {/* List of files */}
      {filesData.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            Files to be uploaded:
          </h2>
          <ul>
            {filesData.map((file) => (
              <li key={file.name} className="ml-4 dark:text-gray-200">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classes={{
          paper: 'bg-white dark:bg-gray-800',
        }}
      >
        <DialogTitle className="dark:text-white">Confirm Upload</DialogTitle>
        <DialogContent className="dark:text-gray-200">
          <DialogContentText className="dark:text-gray-300">
            Are you sure you want to upload these files to the "
            {destFolderName}" folder?
          </DialogContentText>
          <div className="mt-4">
            <ul>
              {filesData.map((file) => (
                <li key={file.name} className="ml-4 dark:text-gray-200">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsModalOpen(false)}
            className="dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmUpload}
            color="primary"
            variant="contained"
            disabled={isLoading}
            className="dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            {isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UploadFiles;
