import { type NextApiRequest, type NextApiResponse } from 'next';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { getSession } from 'next-auth/react';

// Initialize Google Cloud Storage
const storage = new Storage({
 projectId: 'careful-journey-435817-k2',
 keyFilename: 'Auth/careful-journey-435817-k2-52c8d8b8258b.json',
});


const BUCKET_NAME = 'a11y';
const JSON_FILE_NAME = 'data.json';


// Configure Multer
const upload = multer({
 storage: multer.memoryStorage(),
});


function runMiddleware(
 req: NextApiRequest,
 res: NextApiResponse,
 fn: Function
): Promise<void> {
 return new Promise((resolve, reject) => {
   fn(req, res, (result: any) => {
     if (result instanceof Error) return reject(result);
     return resolve();
   });
 });
}


// Disable Next.js body parsing to allow Multer to handle it
export const config = {
 api: {
   bodyParser: false,
 },
};


export default async function handler(
 req: NextApiRequest & { files: any[] },
 res: NextApiResponse
) {
 // Authentication middleware
 const session = await getSession({ req });
 if (!session) {
   res.status(401).json({ error: 'Unauthorized' });
   return;
 }


 if (req.method === 'POST') {
   try {
     // Run Multer middleware to handle file uploads
     await runMiddleware(req, res, upload.any());


     const { destFolderName } = req.body;
     const files = req.files;
     let paths = req.body.paths;


     if (!files || files.length === 0) {
       return res.status(400).json({ error: 'No files uploaded' });
     }


     if (!destFolderName) {
       return res.status(400).json({ error: 'Destination folder name is required' });
     }


     if (!paths) {
       return res.status(400).json({ error: 'Paths not provided' });
     }


     // Ensure paths is an array
     if (!Array.isArray(paths)) {
       paths = [paths];
     }


     if (paths.length !== files.length) {
       return res
         .status(400)
         .json({ error: 'Mismatch between number of files and paths' });
     }


     const bucket = storage.bucket(BUCKET_NAME);


     // Upload files to Google Cloud Storage
     for (let i = 0; i < files.length; i++) {
       const file = files[i];
       const relativePath = paths[i];


       const remotePath = path.posix.join(
         destFolderName,
         relativePath.replace(/\\/g, '/')
       );
       const blob = bucket.file(remotePath);
       await blob.save(file.buffer, {
         contentType: file.mimetype,
       });


       // Add relativePath to the file object for later use
       file.relativePath = relativePath;
     }


     // Update JSON file
     await updateJsonFile(bucket, destFolderName, files);


     res.status(200).json({ message: 'Folders uploaded successfully' });
   } catch (error: any) {
     console.error('Error uploading files:', error);
     res.status(500).json({
       error: 'An error occurred while uploading files.',
       details: error.message,
     });
   }
 } else if (req.method === 'GET') {
   try {
     res.status(200).json({ message: 'API is responding' });
   } catch (error: any) {
     console.error('Error in GET route:', error);
     res.status(500).json({ error: 'An error occurred in GET route.' });
   }
 } else {
   res.status(405).json({ error: 'Method Not Allowed' });
 }
}


// Helper function to update the JSON file
async function updateJsonFile(
 bucket: import('@google-cloud/storage').Bucket,
 destFolderName: string,
 files: any[]
) {
 const jsonFile = bucket.file(JSON_FILE_NAME);


 let jsonContent: any = {
   type: 'directory',
   name: 'A11yGator',
   children: [],
 };


 // Check if the JSON file exists
 const [exists] = await jsonFile.exists();
 if (exists) {
   const [contents] = await jsonFile.download();
   jsonContent = JSON.parse(contents.toString());
 }


 // Update the JSON content
 jsonContent = updateJsonStructure(jsonContent, destFolderName, files);


 await jsonFile.save(JSON.stringify(jsonContent, null, 2), {
   contentType: 'application/json',
 });
}


function updateJsonStructure(
 jsonContent: any,
 destFolderName: string,
 files: any[]
) {
 // Find or create the 'course' node matching destFolderName
 let courseNode = jsonContent.children.find(
   (child: any) => child.type === 'course' && child.name === destFolderName
 );


 if (!courseNode) {
   courseNode = {
     type: 'course',
     name: destFolderName,
     children: [],
   };
   jsonContent.children.push(courseNode);
 }


 // Build the new folder structure from the uploaded files
 const newChildren = buildJsonTreeFromFiles(files);


 // Merge the newChildren into courseNode.children
 courseNode.children = mergeChildren(courseNode.children, newChildren);


 return jsonContent;
}


function buildJsonTreeFromFiles(files: any[]) {
 const root: any = {};


 files.forEach((file) => {
   const relativePath = file.relativePath.replace(/\\/g, '/');
   const parts = relativePath.split('/').filter((part: string) => part !== '');
   let currentLevel = root;


   parts.forEach((part: string, index: number) => {
     if (!currentLevel[part]) {
       currentLevel[part] = {
         type: index === parts.length - 1 ? 'file' : 'folder',
         name: part,
         children: index === parts.length - 1 ? undefined : {},
       };
     }
     currentLevel = currentLevel[part].children || {};
   });
 });


 // Convert the tree structure to JSON.
 const convertToJsonArray = (node: any) => {
   return Object.values(node).map((child: any) => {
     if (child.type === 'file') {
       return {
         type: 'file',
         name: child.name,
       };
     } else {
       return {
         type: child.name === 'images' ? 'images' : 'coursefolder',
         name: child.name,
         children: convertToJsonArray(child.children),
       };
     }
   });
 };


 return convertToJsonArray(root);
}


function mergeChildren(existingChildren: any[], newChildren: any[]) {
 const merged = [...existingChildren];


 for (const newChild of newChildren) {
   const existingChildIndex = merged.findIndex(
     (child) => child.name === newChild.name && child.type === newChild.type
   );


   if (existingChildIndex >= 0) {
     if (newChild.children) {
       merged[existingChildIndex].children = mergeChildren(
         merged[existingChildIndex].children || [],
         newChild.children
       );
     }
   } else {
     merged.push(newChild);
   }
 }


 return merged;
}



