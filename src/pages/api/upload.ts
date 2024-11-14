import { type NextApiRequest, type NextApiResponse } from 'next';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';
import { getSession } from 'next-auth/react';

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: 'your-project-id',
  keyFilename: 'path-to-your-key-file.json',
});

const BUCKET_NAME = 'a11y';

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
      await runMiddleware(req, res, upload.array('files'));

      const { destFolderName } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      if (!destFolderName) {
        return res
          .status(400)
          .json({ error: 'Destination folder name is required' });
      }

      const bucket = storage.bucket(BUCKET_NAME);

      // Upload files to Google Cloud Storage in parallel
      const uploadPromises = files.map((file) => {
        const remotePath = path.posix.join(destFolderName, file.originalname);
        const blob = bucket.file(remotePath);
        return blob.save(file.buffer, {
          contentType: file.mimetype,
        });
      });

      await Promise.all(uploadPromises);

      res.status(200).json({ message: 'Files uploaded successfully' });
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
