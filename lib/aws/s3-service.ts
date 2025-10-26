// AWS S3 Service for File Storage
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'agentflow-documents';

export class S3Service {
  /**
   * Upload file to S3
   */
  static async uploadFile(
    file: Buffer,
    fileName: string,
    userId: string,
    agentId?: string,
    metadata?: Record<string, string>
  ): Promise<{
    key: string;
    url: string;
    size: number;
  }> {
    const fileExtension = fileName.split('.').pop();
    const key = agentId
      ? `users/${userId}/agents/${agentId}/${uuidv4()}.${fileExtension}`
      : `users/${userId}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      Metadata: {
        userId,
        ...(agentId && { agentId }),
        originalName: fileName,
        ...metadata,
      },
      ContentType: this.getContentType(fileExtension || ''),
    });

    await s3Client.send(command);

    // Generate presigned URL for access
    const url = await this.getPresignedUrl(key);

    return {
      key,
      url,
      size: file.length,
    };
  }

  /**
   * Get presigned URL for file access
   */
  static async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Delete file from S3
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * List files for user/agent
   */
  static async listFiles(userId: string, agentId?: string): Promise<Array<{
    key: string;
    size: number;
    lastModified: Date;
    url: string;
  }>> {
    const prefix = agentId
      ? `users/${userId}/agents/${agentId}/`
      : `users/${userId}/`;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    if (!response.Contents) return [];

    const files = await Promise.all(
      response.Contents.map(async (item) => ({
        key: item.Key!,
        size: item.Size || 0,
        lastModified: item.LastModified || new Date(),
        url: await this.getPresignedUrl(item.Key!),
      }))
    );

    return files;
  }

  /**
   * Get file content
   */
  static async getFileContent(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const stream = response.Body as any;
    
    const chunks: Uint8Array[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }

  /**
   * Get content type based on file extension
   */
  private static getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain',
      md: 'text/markdown',
      json: 'application/json',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

export default S3Service;
