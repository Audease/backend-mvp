import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { format } from 'util';

@Injectable()
export class StorageService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    try {
      this.storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        credentials: {
          client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(
            /\\n/g,
            '\n'
          ),
        },
      });

      this.bucket = process.env.GOOGLE_CLOUD_BUCKET_NAME;

      // Verify connection
      this.storage
        .bucket(this.bucket)
        .exists()
        .then(([exists]) => {
          if (!exists) {
            console.error('Bucket does not exist:', this.bucket);
          }
        })
        .catch(error => {
          console.error('Error verifying bucket:', error);
        });
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async uploadImage(image: string): Promise<string> {
    try {
      // Generate unique filename
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}.jpg`;
      const file = this.storage.bucket(this.bucket).file(fileName);

      // Create write stream and upload
      const stream = file.createWriteStream({
        metadata: {
          contentType: 'image/jpeg',
        },
        resumable: false,
      });

      // Convert base64 to buffer if image is base64 string
      const buffer = Buffer.from(image.split(',')[1], 'base64');

      return new Promise((resolve, reject) => {
        stream.on('error', error => {
          reject(error);
        });

        stream.on('finish', async () => {
          // Make the file public
          await file.makePublic();

          // Get public URL
          const publicUrl = format(
            `https://storage.googleapis.com/${this.bucket}/${fileName}`
          );
          resolve(publicUrl);
        });

        stream.end(buffer);
      });
    } catch (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  async uploadBuffer(file: Express.Multer.File): Promise<string> {
    try {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1000)}-${file.originalname}`;
      const bucket = this.storage.bucket(this.bucket);
      const blob = bucket.file(fileName);

      // Upload the file
      await blob.save(file.buffer, {
        contentType: file.mimetype,
        public: true,
      });

      // Return the public URL
      return `https://storage.googleapis.com/${this.bucket}/${fileName}`;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      // Extract filename from URL if full URL is provided
      const name = fileName.split('/').pop();
      await this.storage.bucket(this.bucket).file(name).delete();
    } catch (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}
