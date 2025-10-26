import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import S3Service from '@/lib/aws/s3-service';
import { ragSystem } from '@/lib/rag/rag-system';
import DynamoDBService, { TABLES } from '@/lib/db/dynamodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const knowledgeBaseId = formData.get('knowledgeBaseId') as string;
    const agentId = formData.get('agentId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!knowledgeBaseId) {
      return NextResponse.json({ error: 'Knowledge base ID is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
      'text/csv',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: PDF, DOC, DOCX, TXT, MD, CSV' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to S3
    const s3Result = await S3Service.uploadFile(
      buffer,
      file.name,
      session.user.sub,
      agentId || undefined,
      {
        knowledgeBaseId,
        contentType: file.type,
      }
    );

    // Create document record
    const documentId = `doc_${uuidv4()}`;
    const document = {
      PK: `KB#${knowledgeBaseId}`,
      SK: `DOC#${documentId}`,
      id: documentId,
      knowledgeBaseId,
      userId: session.user.sub,
      agentId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      s3Key: s3Result.key,
      s3Url: s3Result.url,
      status: 'processing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await DynamoDBService.put(TABLES.KNOWLEDGE_BASES, document);

    // Extract text and process (async)
    processDocument(documentId, knowledgeBaseId, buffer, file.type, session.user.sub)
      .catch(error => console.error('Document processing error:', error));

    return NextResponse.json({
      success: true,
      document: {
        id: documentId,
        fileName: file.name,
        fileSize: file.size,
        status: 'processing',
        s3Key: s3Result.key,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error.message },
      { status: 500 }
    );
  }
}

async function processDocument(
  documentId: string,
  knowledgeBaseId: string,
  buffer: Buffer,
  fileType: string,
  userId: string
) {
  try {
    // Extract text based on file type
    let text = '';

    if (fileType === 'text/plain' || fileType === 'text/markdown') {
      text = buffer.toString('utf-8');
    } else if (fileType === 'application/pdf') {
      // For PDF, you'd use a library like pdf-parse
      // For now, placeholder
      text = buffer.toString('utf-8');
    } else if (fileType.includes('word')) {
      // For Word docs, you'd use mammoth or similar
      // For now, placeholder
      text = buffer.toString('utf-8');
    }

    // Add to RAG system
    await ragSystem.addDocuments(knowledgeBaseId, [
      {
        content: text,
        metadata: {
          documentId,
          source: 'upload',
          userId,
        },
      },
    ]);

    // Update document status
    await DynamoDBService.update(
      TABLES.KNOWLEDGE_BASES,
      { PK: `KB#${knowledgeBaseId}`, SK: `DOC#${documentId}` },
      'SET #status = :status, updatedAt = :updatedAt, vectorized = :vectorized',
      {
        ':status': 'completed',
        ':updatedAt': new Date().toISOString(),
        ':vectorized': true,
      },
      { '#status': 'status' }
    );
  } catch (error) {
    console.error('Document processing error:', error);
    
    // Update document status to error
    await DynamoDBService.update(
      TABLES.KNOWLEDGE_BASES,
      { PK: `KB#${knowledgeBaseId}`, SK: `DOC#${documentId}` },
      'SET #status = :status, updatedAt = :updatedAt, error = :error',
      {
        ':status': 'error',
        ':updatedAt': new Date().toISOString(),
        ':error': error instanceof Error ? error.message : 'Unknown error',
      },
      { '#status': 'status' }
    );
  }
}

// Get documents for a knowledge base
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const knowledgeBaseId = searchParams.get('knowledgeBaseId');

    if (!knowledgeBaseId) {
      return NextResponse.json(
        { error: 'Knowledge base ID is required' },
        { status: 400 }
      );
    }

    const documents = await DynamoDBService.query(
      TABLES.KNOWLEDGE_BASES,
      'PK = :pk AND begins_with(SK, :sk)',
      {
        ':pk': `KB#${knowledgeBaseId}`,
        ':sk': 'DOC#',
      }
    );

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Failed to get documents', details: error.message },
      { status: 500 }
    );
  }
}
