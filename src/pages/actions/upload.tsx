import React, { useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Folder, InsertDriveFile } from '@mui/icons-material';
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
 path: string;
 type: string;
 file: File;
}


interface TreeNode {
 name: string;
 path: string;
 type: 'folder' | 'file';
 children?: TreeNode[];
 fileData?: FileData;
}


const UploadFolder: React.FC = () => {


 const { data: session } = useSession();


 if (session?.user.role !== 'UPLOADER' && session?.user.role !== 'ADMIN') {
   return <Unauthorized/>;
 }
 const [filesData, setFilesData] = useState<FileData[]>([]);
 const [destFolderName, setDestFolderName] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isModalOpen, setIsModalOpen] = useState(false);


 const fileInputRef = useRef<HTMLInputElement | null>(null);


 // Helper function to read files recursively
 const traverseFileTree = useCallback(
   (item: any, path: string): Promise<FileData[]> => {
     return new Promise((resolve) => {
       if (item.isFile) {
         item.file((file: File) => {
           const fileData: FileData = {
             name: file.name,
             path: path + file.name,
             type: file.type,
             file: file,
           };
           resolve([fileData]);
         });
       } else if (item.isDirectory) {
         const dirReader = item.createReader();
         dirReader.readEntries(async (entries: any[]) => {
           const filesPromises = entries.map((entry) =>
             traverseFileTree(entry, path + item.name + '/')
           );
           const filesArrays = await Promise.all(filesPromises);
           const files = filesArrays.flat();
           resolve(files);
         });
       } else {
         resolve([]);
       }
     });
   },
   []
 );


 const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
   const files = event.target.files;
   if (files) {
     setFilesData([]); // Reset files data


     const fileDataArray: FileData[] = [];


     for (let i = 0; i < files.length; i++) {
       const file = files[i];
       const relativePath = file.webkitRelativePath || file.name;
       const fileData: FileData = {
         name: file.name,
         path: relativePath,
         type: file.type,
         file: file,
       };
       fileDataArray.push(fileData);
     }


     setFilesData(fileDataArray);
     console.log('All files have been read from selected folder.');
   }
 };


 const handleDrop = useCallback(
   (event: React.DragEvent<HTMLDivElement>) => {
     event.preventDefault();
     const items = event.dataTransfer.items;
     const folders = [];
     setFilesData([]); // Reset files data


     for (let i = 0; i < items.length; i++) {
       const item = items[i].webkitGetAsEntry();
       if (item && item.isDirectory) {
         folders.push(item);
       } else if (item && item.isFile) {
         alert('Please drop folders, not individual files.');
         return;
       }
     }


     if (folders.length > 5) {
       alert('You can upload up to 5 folders at once.');
       return;
     }


     const traversePromises = folders.map((folder) => traverseFileTree(folder, ''));


     Promise.all(traversePromises).then((filesArrays) => {
       const allFiles = filesArrays.flat();
       setFilesData(allFiles);
       console.log('All files have been read.');
     });
   },
   [traverseFileTree]
 );


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
     alert('Please select or drop folders and provide the destination folder name.');
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
       formData.append('paths', fileData.path);
     });


     const response = await fetch('/api/upload', {
       method: 'POST',
       body: formData,
       credentials: 'include',
     });


     if (response.ok) {
       alert('Folders uploaded successfully');
       setFilesData([]);
       setDestFolderName('');
     } else {
       let errorMessage = 'An error occurred while uploading the folders.';
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
     console.error('Error uploading folders:', error);
     alert('An unexpected error occurred while uploading the folders.');
   } finally {
     setIsLoading(false);
   }
 };


 // Function to build the tree structure from filesData
 const buildFileTree = (filesData: FileData[]): TreeNode[] => {
   const root: Record<string, TreeNode> = {};


   filesData.forEach((file) => {
     const parts = file.path.split('/');
     let currentLevel = root;


     parts.forEach((part, index) => {
       if (part === '') return; // Skip empty strings


       if (!currentLevel[part]) {
         currentLevel[part] = {
           name: part,
           path: parts.slice(0, index + 1).join('/'),
           type: index === parts.length - 1 ? 'file' : 'folder',
           children: index === parts.length - 1 ? undefined : {},
           fileData: index === parts.length - 1 ? file : undefined,
         };
       }


       if (index < parts.length - 1) {
         currentLevel = currentLevel[part].children!;
       }
     });
   });


   const convertToArray = (node: Record<string, TreeNode>): TreeNode[] => {
     return Object.values(node).map((child) => {
       if (child.children) {
         return {
           ...child,
           children: convertToArray(child.children),
         };
       }
       return child;
     });
   };


   return convertToArray(root);
 };


 // Function to render the tree with icons
 const renderTree = (nodes: TreeNode[]) => {
   return (
     <ul>
       {nodes.map((node) => (
         <li key={node.path} className="ml-4">
           <div className="flex items-center dark:text-gray-200">
             {node.type === 'folder' ? (
               <>
                 <Folder className="text-yellow-500 mr-1" />
                 <span className="font-semibold">{node.name}</span>
               </>
             ) : (
               <>
                 <InsertDriveFile className="text-blue-500 mr-1" />
                 <span>{node.name}</span>
               </>
             )}
           </div>
           {node.children && renderTree(node.children)}
         </li>
       ))}
     </ul>
   );
 };


 // Build the file tree from filesData
 const fileTree = buildFileTree(filesData);


 return (
   <div className="p-4 max-w-2xl mx-auto min-h-screen">
     <h1 className="text-2xl font-bold mb-4 dark:text-white">
       Upload Folders to A11yGator
     </h1>
     <div
       onDrop={handleDrop}
       onDragOver={handleDragOver}
       onClick={handleClick}
       className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-10 text-center cursor-pointer mb-4 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
     >
       <p className="text-gray-600 dark:text-gray-300">
         Click or drag and drop up to{' '}
         <span className="font-semibold">5 folders</span> here
       </p>
     </div>
     {/* Hidden file input */}
     <input
       type="file"
       ref={fileInputRef}
       style={{ display: 'none' }}
       // @ts-ignore
       webkitdirectory="true"
       directory=""
       multiple
       onChange={handleFileInputChange}
     />
     <div className="mb-4">
       <TextField
         label="Course Folder"
         variant="outlined"
         fullWidth
         value={destFolderName}
         onChange={(e) => setDestFolderName(e.target.value)}
         InputLabelProps={{ className: 'dark:text-gray-300 ' }}
         InputProps={{
           className: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200',
           // style: { color: 'inherit' },
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
       {isLoading ? 'Uploading...' : 'Upload Folders'}
     </Button>


     {/* list of folders and files */}
     {filesData.length > 0 && (
       <div className="mt-6">
         <h2 className="text-xl font-semibold mb-2 dark:text-white">
           Files to be uploaded:
         </h2>
         <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4">
           {renderTree(fileTree)}
         </div>
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
         <div className="mt-4">{renderTree(fileTree)}</div>
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


export default UploadFolder;


