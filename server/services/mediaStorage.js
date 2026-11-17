import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const localUploadsDir = path.resolve(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

// Multer memory storage allows direct streaming to Cloudinary, AWS S3, or Local Disk
const memoryStorage = multer.memoryStorage();

// File filters
const fileFilter = (allowedMimes) => (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${allowedMimes.join(', ')}`), false);
  }
};

export const resumeUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ])
});

export const videoUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: fileFilter([
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo'
  ])
});

export const imageUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ])
});

/**
 * Universal Cloud / Local Media Storage Engine
 * Supports:
 * - Cloudinary (Optimized for Video Pitch clips & Images)
 * - AWS S3 / Cloudflare R2 / MinIO (Optimized for PDF Resumes & Documents)
 * - Local Disk Storage (Zero-config fallback for offline/development/Render free tier)
 */
class MediaStorageService {
  constructor() {
    this.cloudinary = null;
    this.s3Client = null;
    this.initProviders();
  }

  async initProviders() {
    // 1. Initialize Cloudinary if credentials exist
    if (process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_URL) {
      try {
        const cloudinaryModule = await import('cloudinary');
        this.cloudinary = cloudinaryModule.v2;
        if (process.env.CLOUDINARY_URL) {
          this.cloudinary.config({ cloudinary_url: process.env.CLOUDINARY_URL });
        } else {
          this.cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true
          });
        }
        console.log('☁️ Cloudinary Media Provider initialized');
      } catch (err) {
        console.warn('⚠️ Cloudinary init error:', err.message);
      }
    }

    // 2. Initialize AWS S3 if credentials exist
    if (process.env.AWS_S3_BUCKET && (process.env.AWS_ACCESS_KEY_ID || process.env.AWS_REGION)) {
      try {
        const { S3Client } = await import('@aws-sdk/client-s3');
        this.s3Client = new S3Client({
          region: process.env.AWS_REGION || 'ap-south-1',
          credentials: process.env.AWS_ACCESS_KEY_ID ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          } : undefined,
          endpoint: process.env.AWS_S3_ENDPOINT || undefined, // Supports Cloudflare R2 / MinIO
          forcePathStyle: Boolean(process.env.AWS_S3_FORCE_PATH_STYLE)
        });
        console.log('☁️ AWS S3 Storage Provider initialized for bucket:', process.env.AWS_S3_BUCKET);
      } catch (err) {
        console.warn('⚠️ AWS S3 init error:', err.message);
      }
    }
  }

  /**
   * Upload resume document (PDF / DOCX)
   * Priority: AWS S3 -> Cloudinary -> Local Disk
   */
  async uploadResume(file, user, req) {
    const filename = `resume_${user?.id || 'anon'}_${Date.now()}${path.extname(file.originalname)}`;

    // Try AWS S3
    if (this.s3Client && process.env.AWS_S3_BUCKET) {
      try {
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');
        const key = `resumes/${filename}`;
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        }));

        const s3Base = process.env.AWS_S3_PUBLIC_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com`;
        const url = `${s3Base}/${key}`;
        return {
          provider: 'aws-s3',
          url,
          filename,
          size: file.size,
          mime: file.mimetype
        };
      } catch (err) {
        console.warn('⚠️ S3 upload failed, falling back:', err.message);
      }
    }

    // Try Cloudinary (raw resource type for PDF)
    if (this.cloudinary) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = this.cloudinary.uploader.upload_stream(
            {
              folder: 'jobscout/resumes',
              resource_type: 'raw',
              public_id: path.parse(filename).name
            },
            (err, res) => err ? reject(err) : resolve(res)
          );
          uploadStream.end(file.buffer);
        });

        return {
          provider: 'cloudinary',
          url: result.secure_url,
          filename,
          size: file.size,
          mime: file.mimetype
        };
      } catch (err) {
        console.warn('⚠️ Cloudinary raw upload failed, falling back:', err.message);
      }
    }

    // Fallback: Local Disk
    const targetPath = path.join(localUploadsDir, filename);
    fs.writeFileSync(targetPath, file.buffer);
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/uploads/${filename}`;

    return {
      provider: 'local-disk',
      url,
      filename,
      size: file.size,
      mime: file.mimetype
    };
  }

  /**
   * Upload video intro clip (e.g. 60-second speed elevator pitch)
   * Priority: Cloudinary (auto-transcoding/streaming) -> AWS S3 -> Local Disk
   */
  async uploadVideo(file, user, req) {
    const filename = `pitch_${user?.id || 'anon'}_${Date.now()}${path.extname(file.originalname)}`;

    // Try Cloudinary (optimal for video streaming)
    if (this.cloudinary) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = this.cloudinary.uploader.upload_stream(
            {
              folder: 'jobscout/pitches',
              resource_type: 'video',
              eager: [
                { format: 'mp4', video_codec: 'h264' }
              ]
            },
            (err, res) => err ? reject(err) : resolve(res)
          );
          uploadStream.end(file.buffer);
        });

        return {
          provider: 'cloudinary',
          url: result.secure_url,
          thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, ".jpg"),
          duration: result.duration,
          filename,
          size: file.size
        };
      } catch (err) {
        console.warn('⚠️ Cloudinary video upload failed, falling back:', err.message);
      }
    }

    // Try AWS S3
    if (this.s3Client && process.env.AWS_S3_BUCKET) {
      try {
        const { PutObjectCommand } = await import('@aws-sdk/client-s3');
        const key = `videos/${filename}`;
        await this.s3Client.send(new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype
        }));

        const s3Base = process.env.AWS_S3_PUBLIC_URL || `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com`;
        const url = `${s3Base}/${key}`;
        return {
          provider: 'aws-s3',
          url,
          thumbnailUrl: url,
          filename,
          size: file.size
        };
      } catch (err) {
        console.warn('⚠️ S3 video upload failed, falling back:', err.message);
      }
    }

    // Fallback: Local Disk
    const targetPath = path.join(localUploadsDir, filename);
    fs.writeFileSync(targetPath, file.buffer);
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/uploads/${filename}`;

    return {
      provider: 'local-disk',
      url,
      thumbnailUrl: url,
      filename,
      size: file.size
    };
  }

  /**
   * Upload image (Avatar / Company Logo)
   */
  async uploadImage(file, user, req) {
    const filename = `avatar_${user?.id || 'anon'}_${Date.now()}${path.extname(file.originalname)}`;

    if (this.cloudinary) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = this.cloudinary.uploader.upload_stream(
            {
              folder: 'jobscout/avatars',
              transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
            },
            (err, res) => err ? reject(err) : resolve(res)
          );
          uploadStream.end(file.buffer);
        });

        return {
          provider: 'cloudinary',
          url: result.secure_url,
          filename,
          size: file.size
        };
      } catch (err) {
        console.warn('⚠️ Cloudinary image upload failed:', err.message);
      }
    }

    // Local Disk
    const targetPath = path.join(localUploadsDir, filename);
    fs.writeFileSync(targetPath, file.buffer);
    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/uploads/${filename}`;

    return {
      provider: 'local-disk',
      url,
      filename,
      size: file.size
    };
  }

  getStatus() {
    return {
      cloudinaryConnected: Boolean(this.cloudinary),
      s3Connected: Boolean(this.s3Client),
      defaultProvider: this.cloudinary ? 'cloudinary' : (this.s3Client ? 'aws-s3' : 'local-disk'),
      localStoragePath: localUploadsDir
    };
  }
}

export const mediaStorage = new MediaStorageService();
export default mediaStorage;
