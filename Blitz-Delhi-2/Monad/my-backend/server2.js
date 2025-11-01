// Import required modules
const express = require('express');
const multer = require('multer');
const pinataSDK = require('@pinata/sdk');
const { Readable } = require('stream'); // Import Readable from 'stream'
require('dotenv').config(); // Load environment variables from .env file

// --- Configuration ---

const app = express();
const port = 3000;

// Initialize Pinata SDK
const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

// Configure Multer
// We use 'memoryStorage' to hold the file in a buffer in RAM
// This is efficient for streaming it directly to Pinata without saving to disk.
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Server Routes ---

/**
 * @route POST /upload
 * @description Receives a file from the client and uploads it to Pinata (IPFS).
 * The file is expected to be in a 'form-data' field named 'file'.
 */
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // 1. Check if a file was received
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // 2. Test Pinata authentication
    // This is a good practice to ensure your JWT is working.
    const authResult = await pinata.testAuthentication();
    if (!authResult.authenticated) {
      return res.status(401).json({ error: 'Pinata authentication failed.' });
    }

    // 3. Prepare the file stream
    // Create a readable stream from the file buffer (which is in req.file.buffer)
    const fileStream = Readable.from(req.file.buffer);

    // 4. Set Pinata options
    // We give the file a name on IPFS.
    const options = {
      pinataMetadata: {
        name: req.file.originalname, // Use the original file name
      },
      pinataOptions: {
        cidVersion: 0,
      },
    };

    // 5. Pin the file to IPFS
    console.log('Pinning file to IPFS via Pinata...');
    const result = await pinata.pinFileToIPFS(fileStream, options);

    // 6. Send the successful response back to the client
    console.log('File pinned successfully! CID:', result.IpfsHash);
    res.status(200).json({
      message: 'File uploaded to IPFS successfully.',
      cid: result.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    });

  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    res.status(500).json({ error: 'Server error during file upload.' });
  }
});

// --- Start the Server ---

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});